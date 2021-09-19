
import { 
  getDisplayName, 
  getDisplayNameFlipped, 
  getNextPlayerN, 
  leftmostNonEliminatedPlayerN, 
  getGroupIdStackIndexCardIndex,
  getStackByCardId,
  getCurrentFace,
  processTokenType,
  tokenPrintName,
  checkAlerts,
  getScore,
  playerNToPlayerSpaceN,
  getNextEmptyPlayerN,
} from "./Helpers";
import { setValues } from "./gameUiSlice";
import { GROUPSINFO, PHASEINFO, roundStepToText, nextRoundStep, prevRoundStep, nextPhase, prevPhase } from "./Constants";

const areMultiplayerHotkeysEnabled = (game, chatBroadcast) => {
    if (!game.options.multiplayerHotkeys) {
        chatBroadcast("game_update",{message: "tried to press a multiplayer hotkey (perhaps their Control or Alt key is stuck down?). To enable multiplayer hotkeys, the host must toggle them on first (Shift + L). "});
        return false;
    } else return true;
}

const reveal = (game, deckGroupId, discardGroupId, gameBroadcast, chatBroadcast, facedown) => {
    // Check remaining cards in encounter deck
    const encounterStackIds = game.groupById[deckGroupId].stackIds;
    const encounterDiscardStackIds = game.groupById[discardGroupId].stackIds;
    const stacksLeft = encounterStackIds.length;
    // If no cards, check phase of game
    if (stacksLeft === 0) {
        // If quest phase, shuffle encounter discard pile into deck
        if (game.phase === "Quest") {
            gameBroadcast("game_action",{action:"move_stacks", options:{orig_group_id: discardGroupId, dest_group_id: deckGroupId, top_n: encounterDiscardStackIds.length, position: "s"}});
            chatBroadcast("game_update",{message: " shuffles "+GROUPSINFO[discardGroupId].name+" into "+GROUPSINFO[deckGroupId].name+"."});
            return;
        } else {
            // If not quest phase, give error message and break
            chatBroadcast("game_update",{message: " tried to reveal a card, but the encounter deck is empty and it's not the quest phase."});
            return;
        }
    }
    // Reveal card
    const topStackId = encounterStackIds[0];
    if (!topStackId) {
        chatBroadcast("game_update",{message: " tried to reveal a card, but the encounter deck is empty."});
        return;
    }
    const topStack = game.stackById[topStackId];
    const topCardId = topStack["cardIds"][0];
    const topCard = game.cardById[topCardId];        // Was shift held down? (Deal card facedown)
    const message = facedown ? "added facedown "+getDisplayName(topCard)+" to the staging area." : "revealed "+getDisplayNameFlipped(topCard)+"."
    chatBroadcast("game_update",{message: message});
    gameBroadcast("game_action", {action: "move_stack", options: {stack_id: topStackId, dest_group_id: "sharedStaging", dest_stack_index: -1, combine: false, preserve_state: facedown}})

    // If there was only 1 card left, then it's now empty. If it's the quest phase we need to reshuffle.
    if (stacksLeft === 1 && game.phase === "Quest") {
        gameBroadcast("game_action",{action:"move_stacks", options:{orig_group_id: discardGroupId, dest_group_id: deckGroupId, top_n: encounterDiscardStackIds.length, position: "s"}});
        chatBroadcast("game_update",{message: " shuffles "+GROUPSINFO[discardGroupId].name+" into "+GROUPSINFO[deckGroupId].name+"."});
    }
}

export const gameAction = (action, props) => {
    const {gameUi, playerN, gameBroadcast, chatBroadcast, activeCardAndLoc, setActiveCardAndLoc, dispatch, keypress, setKeypress, setObservingPlayerN} = props;
    if (!playerN) {
        alert("Please sit down to do that.")
        return;
    }
    if (!gameUi || !playerN) return;
    const game = gameUi.game;
    const isHost = playerN === leftmostNonEliminatedPlayerN(gameUi);

    if (action === "refresh") {
        const game = gameUi.game;
        const isHost = playerN === leftmostNonEliminatedPlayerN(gameUi);

        if (game.playerData[playerN].refreshed) {
            const result = window.confirm("Records show that you ("+playerNToPlayerSpaceN(playerN)+") have not triggered a new round since your last refresh. Refresh anyway?")
            //chatBroadcast("game_update", {message: "tried to refresh, but they already refreshed this round."})
            if (!result) return;
        }
        // The player in the leftmost non-eliminated seat is the only one that does the framework game actions.
        // This prevents, for example, the token moving multiple times if players refresh at different times.
        if (isHost) {
            // Set phase
            gameBroadcast("game_action", {action: "update_values", options: {updates: [["game","roundStep", "7.R"], ["game", "phase", "Refresh"]]}});
            chatBroadcast("game_update", {message: "set the round step to "+roundStepToText("7.R")+"."})
            const firstPlayerN = game.firstPlayer;
            const nextPlayerN = getNextPlayerN(gameUi, firstPlayerN);
            // If nextPlayerN is null then it's a solo game, so don't pass the token
            if (nextPlayerN) {
                gameBroadcast("game_action", {action: "update_values", options: {updates: [["game","firstPlayer", nextPlayerN]]}});    
                chatBroadcast("game_update",{message: "moved first player token to "+nextPlayerN+"."});
            }
        }
        // Refresh all cards you control
        chatBroadcast("game_update",{message: "refreshes."});
        gameBroadcast("game_action", {
            action: "action_on_matching_cards", 
            options: {
                criteria:[["controller", playerN], ["locked", false]], 
                action: "update_card_values", 
                options: {updates: [["exhausted", false], ["rotation", 0]]}
            }
        });
        // Raise your threat
        const newThreat = game.playerData[playerN].threat+1;
        chatBroadcast("game_update", {message: "raises threat by 1 ("+newThreat+")."});
        gameBroadcast("game_action", {action: "update_values", options: {updates: [["game", "playerData", playerN, "threat", newThreat], ["game", "playerData", playerN, "refreshed", true]]}});
    } 

    else if (action === "new_round") {
        // Check if refresh is needed
        if (!game.playerData[playerN].refreshed) gameAction("refresh", props);

        // The player in the leftmost non-eliminated seat is the only one that does the framework game actions.
        // This prevents, for example, the round number increasing multiple times.
        if (isHost) {            
            // Update round number
            const roundNumber = game["roundNumber"];
            const newRoundNumber = parseInt(roundNumber) + 1;
            // Calculate round number
            chatBroadcast("game_update", {message: "-----------------------------------------"})
            chatBroadcast("game_update", {message: "-----------------------------------------"})
            chatBroadcast("game_update", {message: "-----------------------------------------"})
            chatBroadcast("game_update", {message: "----------------------------------------- Round "+newRoundNumber})
            chatBroadcast("game_update", {message: "-----------------------------------------"})
            chatBroadcast("game_update", {message: "-----------------------------------------"})
            chatBroadcast("game_update", {message: "-----------------------------------------"})
            chatBroadcast("game_update", {message: "started a new round as host."})
            gameBroadcast("game_action", {action: "update_values", options: {updates: [["game", "phase", "Resource"], ["game", "roundStep", "1.R"]]}})
            chatBroadcast("game_update", {message: "set the round step to "+roundStepToText("1.R")+"."})
            // Update round number
            gameBroadcast("game_action", {action: "update_values", options:{updates:[["game", "roundNumber", newRoundNumber]]}})
            chatBroadcast("game_update",{message: "increased the round number to "+newRoundNumber+"."})
        }
        // Draw a card
        for (var i = 0; i < game.playerData[playerN].cardsDrawn; i++) {
            gameBroadcast("game_action", {action: "draw_card", options: {player_n: playerN}})
            chatBroadcast("game_update",{message: "drew a card."});
        }
        // Add a resource to each hero
        gameBroadcast("game_action", {
            action: "action_on_matching_cards", 
            options: {
                criteria:[["sides","sideUp","type","Hero"],["controller",playerN], ["groupType","play"]], 
                action: "increment_token", 
                options: {token_type: "resource", increment: 1}
            }
        });
        // Reset willpower count and refresh status
        gameBroadcast("game_action", {action: "update_values", options:{updates:[["game", "playerData", playerN, "willpower", 0], ["game", "playerData", playerN, "refreshed", false]]}})
        // Add custom set tokens per round
        gameBroadcast("game_action", {
            action: "action_on_matching_cards", 
            options: {
                criteria:[["controller",playerN], ["groupType","play"]], 
                action: "apply_tokens_per_round", 
                options: {}
            }
        });
        if (isHost) {
            gameBroadcast("game_action", {
                action: "action_on_matching_cards", 
                options: {
                    criteria:[["controller","shared"], ["groupType","play"]], 
                    action: "apply_tokens_per_round", 
                    options: {}
                }
            });
        }
        // Uncommit all characters to the quest
        gameBroadcast("game_action", {
            action: "action_on_matching_cards", 
            options: {
                criteria:[["controller", playerN]], 
                action: "update_card_values", 
                options: {updates: [["committed", false]]}
            }
        });
        // Save replay
        gameBroadcast("game_action", {action: "save_replay", options: {}});
        chatBroadcast("game_update",{message: "saved the replay to their profile."});
        // Check for alerts
        checkAlerts();
    }

    else if (action === "new_round_all") {
        if (!areMultiplayerHotkeysEnabled(game,chatBroadcast)) return;
        for (var i=1; i<=game.numPlayers; i++) {
            const playerI = "player"+i;
            if (!game.playerData[playerI].eliminated) {
                chatBroadcast("game_update",{message: "triggers the new round action for "+playerNToPlayerSpaceN(playerI)});
                const actionProps = {gameUi, playerN: playerI, gameBroadcast, chatBroadcast, activeCardAndLoc, setActiveCardAndLoc, dispatch, keypress, setKeypress, setObservingPlayerN};
                gameAction("new_round", actionProps);
            }
        }
    }

    else if (action === "refresh_all") {
        if (!areMultiplayerHotkeysEnabled(game,chatBroadcast)) return;
        for (var i=1; i<=game.numPlayers; i++) {
            const playerI = "player"+i;
            if (!game.playerData[playerI].eliminated) {
                chatBroadcast("game_update",{message: "triggers the refresh action for "+playerNToPlayerSpaceN(playerI)});
                const actionProps = {gameUi, playerN: playerI, gameBroadcast, chatBroadcast, activeCardAndLoc, setActiveCardAndLoc, dispatch, keypress, setKeypress, setObservingPlayerN};
                gameAction("refresh", actionProps);
            }
        }
    }

    else if (action === "reveal") {
        reveal(game, "sharedEncounterDeck", "sharedEncounterDiscard", gameBroadcast, chatBroadcast, false);
    } 

    else if (action === "reveal_facedown") {
        reveal(game, "sharedEncounterDeck", "sharedEncounterDiscard", gameBroadcast, chatBroadcast, true);
    } 

    else if (action === "reveal_second") {
        reveal(game, "sharedEncounterDeck2", "sharedEncounterDiscard2", gameBroadcast, chatBroadcast, false);
    } 

    else if (action === "reveal_second_facedown") {
        reveal(game, "sharedEncounterDeck2", "sharedEncounterDiscard2", gameBroadcast, chatBroadcast, true);
    } 
    
    else if (action === "draw") {
        // Check remaining cards in deck
        const playerDeck = game.groupById[playerN+"Deck"];
        const deckStackIds = playerDeck["stackIds"];
        const stacksLeft = deckStackIds.length;
        // If no cards, give error message and break
        if (stacksLeft === 0) {
            chatBroadcast("game_update",{message: " tried to draw a card, but their deck is empty."});
            return;
        }
        // Draw card
        chatBroadcast("game_update",{message: "drew a card."});
        gameBroadcast("game_action",{action: "draw_card", options: {player_n: playerN}});
    } 

    // Save replay
    else if (action === "save") {
        gameBroadcast("game_action", {action: "save_replay", options: {}});
        chatBroadcast("game_update", {message: "saved the replay to their profile."});
    } 
    
    else if (action === "shadows") {
        // Deal all shadow cards
        // Set phase
        gameBroadcast("game_action", {action: "update_values", options: {updates: [["game","roundStep", "6.2"], ["game", "phase", "Combat"]]}});
        chatBroadcast("game_update", {message: "set the round step to "+roundStepToText("6.2")+"."});
        gameBroadcast("game_action", {action: "deal_all_shadows", options: {}});
    } 
    
    else if (action === "discard_shadows") {
        // Discard all shadow cards
        // Set phase
        gameBroadcast("game_action", {action: "update_values", options: {updates: [["game","roundStep", "6.11"], ["game", "phase", "Combat"]]}});
        chatBroadcast("game_update", {message: "set the round step to "+roundStepToText("6.11")+"."});

        gameBroadcast("game_action", {
            action: "action_on_matching_cards", 
            options: {
                criteria:[["rotation", -30]], 
                action: "discard_card", 
                options: {}
            }
        });
        chatBroadcast("game_update", {message: "discarded all shadow cards."});
        
    } 
    
    else if (action === "undo") {
        // Undo an action
        if (game.replayStep <= 0) {
            chatBroadcast("game_update", {message: "tried to undo an action, but no previous actions exist."});
        } else {
            gameBroadcast("game_action", {action: "step_through", options: {size: "single", direction: "undo", preserve_undo: true}});
            chatBroadcast("game_update", {message: "pressed undo."});
            // Clear GiantCard
            setActiveCardAndLoc(null);
        }
    } 

    else if (action === "undo_many") {
        // Undo an action
        if (game.replayStep <= 0) {
            chatBroadcast("game_update", {message: "tried to undo an action, but no previous actions exist."});
        } else {
            gameBroadcast("game_action", {action: "step_through", options: {size: "round", direction: "undo", preserve_undo: true}});
            chatBroadcast("game_update", {message: "rewinds a round."});
            // Clear GiantCard
            setActiveCardAndLoc(null);
        }
    } 
    
    else if (action === "redo") {
        // Redo an action
        if (game.replayStep >= game.replayLength) {
            chatBroadcast("game_update", {message: "tried to redo an action, but the game is current."});
        } else {
            gameBroadcast("game_action", {action: "step_through", options: {size: "single", direction: "redo", preserve_undo: true}});
            chatBroadcast("game_update", {message: "pressed redo."});
            // Clear GiantCard
            setActiveCardAndLoc(null);
        }
    }
    
    else if (action === "redo_many") {
        // Redo an action
        if (game.replayStep >= game.replayLength) {
            chatBroadcast("game_update", {message: "tried to redo an action, but the game is current."});
        } else {
            gameBroadcast("game_action", {action: "step_through", options: {size: "round", direction: "redo", preserve_undo: true}});
            chatBroadcast("game_update", {message: "fast-forwards a round."});
            // Clear GiantCard
            setActiveCardAndLoc(null);
        }
    }
    
    else if (action === "next_step" || action === "prev_step") {
        // Next/prev step
        const stepPhase = action === "next_step" ? nextRoundStep(game.roundStep) : prevRoundStep(game.roundStep);
        if (stepPhase) {
            gameBroadcast("game_action", {action: "update_values", options: {updates: [["game","roundStep", stepPhase["roundStep"]], ["game", "phase", stepPhase["phase"]]]}});
            chatBroadcast("game_update", {message: "set the round step to "+roundStepToText(stepPhase["roundStep"])+"."});
            // Handle targeting
            const triggerCardIds = game.triggerMap[stepPhase["roundStep"]];     
            // Remove targets from all cards you targeted
            gameBroadcast("game_action", {
                action: "action_on_matching_cards", 
                options: {
                    criteria:[["targeting", playerN, true]], 
                    action: "update_card_values", 
                    options: {updates: [["targeting", playerN, false]]}
                }
            });
            if (triggerCardIds && triggerCardIds.length > 0) {
                chatBroadcast("game_update", {message: "removes targets."})
                gameBroadcast("game_action", {action: "target_card_ids", options:{card_ids: triggerCardIds}});
            }
        }
    }

    else if (action === "next_phase" || action === "prev_phase") {
        // Next/prev phase
        const stepPhase = action === "next_phase" ? nextPhase(game.phase) : prevPhase(game.phase);
        if (stepPhase) {
            gameBroadcast("game_action", {action: "update_values", options: {updates: [["game","roundStep", stepPhase["roundStep"]], ["game", "phase", stepPhase["phase"]]]}});
            chatBroadcast("game_update", {message: "set the round step to "+roundStepToText(stepPhase["roundStep"])+"."});
        }
    }

    else if (action === "mulligan") {
        if (window.confirm('Shuffle hand in deck and redraw equal number?')) {
            const hand = game.groupById[playerN+"Hand"];
            const handSize = hand.stackIds.length;
            gameBroadcast("game_action", {action: "move_stacks", options: {orig_group_id: playerN+"Hand", dest_group_id: playerN+"Deck", top_n: handSize, position: "shuffle"}})
            gameBroadcast("game_action", {action: "move_stacks", options: {orig_group_id: playerN+"Deck", dest_group_id: playerN+"Hand", top_n: handSize, position: "top"}})
            chatBroadcast("game_update", {message: "shuffled "+handSize+" cards into their deck and redrew an equal number."})
        }
    } 
    
    else if (action === "clear_targets") {
        // Remove targets from all cards you targeted
        chatBroadcast("game_update",{message: "removes all targets."});
        gameBroadcast("game_action", {
            action: "action_on_matching_cards", 
            options: {
                criteria:[["targeting", playerN, true]], 
                action: "update_card_values", 
                options: {updates: [["targeting", playerN, false]]}
            }
        });
        gameBroadcast("game_action", {
            action: "update_values", 
            options: {
                updates:[["game", "playerData", playerN, "arrows", []]], 
            }
        });
    }    
    else if (action === "caps_lock_A") {
        chatBroadcast("game_update",{message: "pressed Shift-A instead of A. Is caps lock on?"});
    }
    else if (action === "caps_lock_n") {
        chatBroadcast("game_update",{message: "pressed N instead of Shift-N. Is caps lock on?"});
    }
    else if (action === "score") {
        const score = getScore(gameUi, gameBroadcast, chatBroadcast)
        chatBroadcast("game_update",{message: "calculated score: "+score});
    }
    else if (action === "increase_threat") {
        // Raise your threat
        const newThreat = game.playerData[playerN].threat + 1;
        chatBroadcast("game_update", {message: "raises "+playerNToPlayerSpaceN(playerN)+"'s threat by 1 ("+newThreat+")."});
        gameBroadcast("game_action", {action: "update_values", options: {updates: [["game", "playerData", playerN, "threat", newThreat]]}});
    }
    else if (action === "increase_threat_all") {
        if (!areMultiplayerHotkeysEnabled(game,chatBroadcast)) return;
        for (var i=1; i<=game.numPlayers; i++) {
            const playerI = "player"+i;
            if (!game.playerData[playerI].eliminated) {
                const actionProps = {gameUi, playerN: playerI, gameBroadcast, chatBroadcast, activeCardAndLoc, setActiveCardAndLoc, dispatch, keypress, setKeypress};
                gameAction("increase_threat", actionProps);
            }
        }
    }
    else if (action === "decrease_threat") {
        // Raise your threat
        var newThreat = game.playerData[playerN].threat - 1;
        newThreat = newThreat < 0 ? 0 : newThreat; 
        chatBroadcast("game_update", {message: "reduces "+playerNToPlayerSpaceN(playerN)+"'s threat by 1 ("+newThreat+")."});
        gameBroadcast("game_action", {action: "update_values", options: {updates: [["game", "playerData", playerN, "threat", newThreat]]}});
    }
    else if (action === "decrease_threat_all") {
        for (var i=1; i<=game.numPlayers; i++) {
            const playerI = "player"+i;
            if (!game.playerData[playerI].eliminated) {
                const actionProps = {gameUi, playerN: playerI, gameBroadcast, chatBroadcast, activeCardAndLoc, setActiveCardAndLoc, dispatch, keypress, setKeypress};
                gameAction("decrease_threat", actionProps);
            }
        }
    }
    else if (action === "next_seat") {
        if (!areMultiplayerHotkeysEnabled(game,chatBroadcast)) return;
        // Get up from any seats first
        const nextPlayerN = getNextEmptyPlayerN(gameUi, playerN);
        const myUserId = gameUi.playerIds[playerN];
        if (nextPlayerN) {
            gameBroadcast("game_action", {action: "set_seat", options: {"player_n": playerN, "user_id": null}});
            chatBroadcast("game_update", {message: "got up from "+playerNToPlayerSpaceN(playerN)+"'s seat."});
            // Sit in seat
            gameBroadcast("game_action", {action: "set_seat", options: {"player_n": nextPlayerN, "user_id": myUserId}});
            chatBroadcast("game_update",{message: "sat in "+playerNToPlayerSpaceN(nextPlayerN)+"'s seat."});
            setObservingPlayerN(nextPlayerN);
        } else {
            chatBroadcast("game_update",{message: "tried to sit in the next open seat, but there was none."});
        }
    }
    else if (action === "draw_next_seat") {
        if (!areMultiplayerHotkeysEnabled(game,chatBroadcast)) return;
        // Get up from any seats first
        const nextPlayerN = getNextEmptyPlayerN(gameUi, playerN);
        if (nextPlayerN) {
            chatBroadcast("game_update", {message: "triggers the draw action for "+playerNToPlayerSpaceN(nextPlayerN)+"."});
            const actionProps = {gameUi, playerN: nextPlayerN, gameBroadcast, chatBroadcast, activeCardAndLoc, setActiveCardAndLoc, dispatch, keypress, setKeypress, setObservingPlayerN};
            gameAction("draw", actionProps);
        } else {
            chatBroadcast("game_update",{message: "tried to draw a card for the next open seat, but there was none."});
        }
    }
    else if (action === "multiplayer_hotkeys") {
        if (!isHost) {
            chatBroadcast("game_update", {message: "tried to toggle multiplayer hotkeys, but they are not the host."});
            return;
        }
        const newValue = !game.options.multiplayerHotkeys;
        const newOptions = {...game.options, multiplayerHotkeys: newValue};
        chatBroadcast("game_update", {message: "turned multiplayer hotkeys "+(newValue ? "on" : "off")+"."});
        gameBroadcast("game_action", {action: "update_values", options: {updates: [["game", "options", newOptions]]}});
    }
}


export const cardAction = (action, cardId, options, props) => {
    const {gameUi, playerN, gameBroadcast, chatBroadcast, activeCardAndLoc, setActiveCardAndLoc, dispatch, keypress, setKeypress, setObservingPlayerN} = props;
    if (!playerN) {
        alert("Please sit down to do that.")
        return;
    }
    if (!gameUi || !playerN || !cardId) return;
    const game = gameUi.game;
    const card = game.cardById[cardId];
    const isHost = playerN === leftmostNonEliminatedPlayerN(gameUi);
    const cardFace = getCurrentFace(card);
    const displayName = getDisplayName(card);
    const tokens = card.tokens;
    const gsc = getGroupIdStackIndexCardIndex(game, cardId);
    const groupId = gsc.groupId;
    const stackIndex = gsc.stackIndex;
    const cardIndex = gsc.cardIndex;
    const group = game.groupById[groupId];
    const groupType = group.type;
    const stackId = group.stackIds[stackIndex];

    // Set tokens to 0
    if (action === "zero_tokens") {
        var newTokens = tokens;
        for (var tokenType in newTokens) {
            if (newTokens.hasOwnProperty(tokenType)) {
                newTokens = {...newTokens, [tokenType]: 0};
                //newTokens[tokenType] = 0; 
            }
        }
        const updates = [["game","cardById",cardId,"tokens", newTokens]];
        dispatch(setValues({updates: updates}))
        gameBroadcast("game_action", {action:"update_values", options:{updates: updates}});
        chatBroadcast("game_update", {message: "cleared all tokens from "+displayName+"."});
    }
    // Exhaust card
    else if (action === "toggle_exhaust" && groupType === "play") {
        if (cardFace.type === "Location") {
            chatBroadcast("game_update", {message: "made "+displayName+" the active location."});
            gameBroadcast("game_action", {action: "move_stack", options: {stack_id: stackId, dest_group_id: "sharedActive", dest_stack_index: 0, combine: false, preserve_state: false}})
            setActiveCardAndLoc(null);
        } else {
            var values = [true, 90];
            if (card.exhausted) {
                values = [false, 0];
                chatBroadcast("game_update", {message: "readied "+displayName+"."});
            } else {
                chatBroadcast("game_update", {message: "exhausted "+displayName+"."});
            }
            const updates = [["game", "cardById", cardId, "exhausted", values[0]], ["game", "cardById", cardId, "rotation", values[1]]];
            dispatch(setValues({updates: updates}));
            gameBroadcast("game_action", {action: "update_values", options:{updates: updates}});
        }
    }
    // Flip card
    else if (action === "flip") {
        var newSide = "A";
        if (card["currentSide"] === "A") newSide = "B";
        const updates = [["game","cardById",cardId,"currentSide", newSide]]
        dispatch(setValues({updates: updates}))
        setActiveCardAndLoc({...activeCardAndLoc, card: {...card, currentSide: newSide}, clicked: false})
        gameBroadcast("game_action", {action: "flip_card", options:{card_id: cardId}});
        if (displayName==="player card" || displayName==="encounter card") {
            chatBroadcast("game_update", {message: "flipped "+getDisplayName(card)+" faceup."});
        } else {
            chatBroadcast("game_update", {message: "flipped "+displayName+" over."});
        }
    }
    else if (action === "commit" || action === "commit_without_exhausting") {
        const playerController = card.controller;
        if (playerController === "shared") return;
        var questingStat = "willpower";
        if (game.questMode === "Battle") questingStat = "attack";
        if (game.questMode === "Siege")  questingStat = "defense";
        // Commit to quest and exhaust
        if (action === "commit" && groupType === "play" && !card["committed"] && !card["exhausted"]) {
            // const currentWillpower = game.playerData[playerN].willpower;
            // const newWillpower = currentWillpower + getCardWillpower(activeCard);
            const willpowerIncrement = cardFace[questingStat] + card.tokens[questingStat];
            const currentWillpower = game.playerData[playerController].willpower;
            const newWillpower = currentWillpower + willpowerIncrement;
            const updates = [
                ["game", "cardById", cardId, "committed", true], 
                ["game", "cardById", cardId, "exhausted", true], 
                ["game", "cardById", cardId, "rotation", 90],
                ["game", "playerData", playerController, "willpower", newWillpower],
            ];
            chatBroadcast("game_update", {message: "committed "+displayName+" to the quest."});
            //dispatch(setValues({updates: updates}));
            gameBroadcast("game_action", {action: "update_values", options:{updates: updates}});
        }
        // Commit to quest without exhausting
        else if (action === "commit_without_exhausting" && groupType === "play" && !card["committed"] && !card["exhausted"]) {
            const willpowerIncrement = cardFace[questingStat] + card.tokens[questingStat];
            const currentWillpower = game.playerData[playerController].willpower;
            const newWillpower = currentWillpower + willpowerIncrement;
            const updates = [["game", "cardById", cardId, "committed", true], ["game", "playerData", playerController, "willpower", newWillpower]];
            chatBroadcast("game_update", {message: "committed "+displayName+" to the quest without exhausting."});
            //dispatch(setValues({updates: updates}));
            gameBroadcast("game_action", {action: "update_values", options:{updates: updates}});
        }
        // Uncommit to quest and ready
        else if (action === "commit" && groupType === "play" && card["committed"]) {
            const willpowerIncrement = cardFace[questingStat] + card.tokens[questingStat];
            const currentWillpower = game.playerData[playerController].willpower;
            const newWillpower = currentWillpower - willpowerIncrement;
            const updates = [
                ["game", "cardById", cardId, "committed", false], 
                ["game", "cardById", cardId, "exhausted", false], 
                ["game", "cardById", cardId, "rotation", 0],
                ["game", "playerData", playerController, "willpower", newWillpower]
            ];
            chatBroadcast("game_update", {message: "uncommitted "+displayName+" to the quest."});
            if (card["exhausted"]) chatBroadcast("game_update", {message: "readied "+displayName+"."});
            //dispatch(setValues({updates: updates}));
            gameBroadcast("game_action", {action: "update_values", options:{updates: updates}});
        }
        // Uncommit to quest without readying
        else if (action === "commit_without_exhausting" && groupType === "play" && card["committed"]) {
            const willpowerIncrement = cardFace[questingStat] + card.tokens[questingStat];
            const currentWillpower = game.playerData[playerController].willpower;
            const newWillpower = currentWillpower - willpowerIncrement;
            const updates = [["game", "cardById", cardId, "committed", false], ["game", "playerData", playerController, "willpower", newWillpower]];
            chatBroadcast("game_update", {message: "uncommitted "+displayName+" to the quest."});
            //dispatch(setValues({updates: updates}));
            gameBroadcast("game_action", {action: "update_values", options:{updates: updates}});
        }

        if (isHost && game.roundStep !== "3.2") {            
            gameBroadcast("game_action", {action: "update_values", options: {updates: [["game","roundStep", "3.2"], ["game", "phase", "Quest"]]}});
            chatBroadcast("game_update", {message: "set the round step to "+roundStepToText("3.2")+"."});
        }
    }
    // Deal shadow card
    else if (action === "deal_shadow" && groupType === "play") {
        const encounterStackIds = game.groupById.sharedEncounterDeck.stackIds;
        const stacksLeft = encounterStackIds.length;
        // If no cards, check phase of game
        if (stacksLeft === 0) {
            chatBroadcast("game_update",{message: " tried to deal a shadow card, but the encounter deck is empty."});
        } else {
            gameBroadcast("game_action", {action: "deal_shadow", options:{card_id: cardId}});
            chatBroadcast("game_update", {message: "dealt a shadow card to "+displayName+"."});
        }
    }
    // Add target to card
    else if (action === "target") {
        const targetingPlayerN = card.targeting[playerN];
        var values = [true];
        if (targetingPlayerN) {
            values = [false]
            chatBroadcast("game_update", {message: "removed target from "+displayName+"."});
        } else {
            values = [true]
            chatBroadcast("game_update", {message: "targeted "+displayName+"."});
        }
        const updates = [["game", "cardById", cardId, "targeting", playerN, values[0]]];
        dispatch(setValues({updates: updates}));
        gameBroadcast("game_action", {action: "update_values", options:{updates: updates}});
    }
    // Send to victory display
    else if (action === "victory") {
        chatBroadcast("game_update", {message: "added "+displayName+" to the victory display."});
        gameBroadcast("game_action", {action: "move_card", options: {card_id: cardId, dest_group_id: "sharedVictory", dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}})
        // Clear GiantCard
        setActiveCardAndLoc(null);
    }
    // Send to appropriate discard pile
    else if (action === "discard") {
        // If the card has victory points, ask if you want to send it to the VD
        if (cardFace.victoryPoints && cardFace.victoryPoints > 0 && cardIndex === 0 && window.confirm("This card has victory points. Send it to the victory display?")) {
            cardAction("victory", cardId, options, props);
            return;            
        }
        // If card is the parent card of a stack, discard the whole stack
        if (cardIndex === 0) {
            const stack = getStackByCardId(game.stackById, cardId);
            if (!stack) return;
            const cardIds = stack.cardIds;
            for (var id of cardIds) {
                const cardi = game.cardById[id];
                const discardGroupId = cardi["discardGroupId"];
                chatBroadcast("game_update", {message: "discarded "+getDisplayName(cardi)+" to "+GROUPSINFO[discardGroupId].name+"."});
                gameBroadcast("game_action", {action: "move_card", options: {card_id: id, dest_group_id: discardGroupId, dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}})
            }
        // If the card is a child card in a stack, just discard that card
        } else {
            const discardGroupId = card["discardGroupId"];
            chatBroadcast("game_update", {message: "discarded "+displayName+" to "+GROUPSINFO[discardGroupId].name+"."});
            gameBroadcast("game_action", {action: "move_card", options: {card_id: cardId, dest_group_id: discardGroupId, dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}})
        }
        // If the card was a quest card, load the next quest card
        if (cardFace.type === "Quest") {
            const questDeckStackIds = card.deckGroupId ? game.groupById[card.deckGroupId]?.stackIds : game.groupById[card.loadGroupId]?.stackIds;
            if (questDeckStackIds?.length > 0) {
                chatBroadcast("game_update", {message: "advanced the quest."});
                gameBroadcast("game_action", {action: "move_stack", options: {stack_id: questDeckStackIds[0], dest_group_id: groupId, dest_stack_index: stackIndex, dest_card_index: 0, combine: false, preserve_state: false}})
            }
        }
        // Clear GiantCard
        setActiveCardAndLoc(null);
    }
    // Shufle card into owner's deck
    else if (action === "shuffle_into_deck") {
        // determine destination groupId
        const destGroupId = card.owner === "shared" ? "sharedEncounterDeck" : card.owner + "Deck";
        gameBroadcast("game_action", {action: "move_card", options: {card_id: cardId, dest_group_id: destGroupId, dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}})
        gameBroadcast("game_action", {action: "shuffle_group", options: {group_id: destGroupId}})
        chatBroadcast("game_update", {message: "shuffled "+displayName+" from "+GROUPSINFO[groupId].name+" into "+GROUPSINFO[destGroupId].name+"."})
        // Clear GiantCard
        setActiveCardAndLoc(null);
    }
    // Draw an arrow
    else if (action === "draw_arrow") {
        // Determine if this is the start or end of the arrow
        const drawingArrowFrom = keypress["w"];
        if (drawingArrowFrom) {
            const drawingArrowTo = cardId;
            const oldArrows = game.playerData[playerN].arrows;
            const newArrows = oldArrows.concat([[drawingArrowFrom, drawingArrowTo]]);
            const updates = [["game", "playerData", playerN, "arrows", newArrows]];
            dispatch(setValues({updates: updates}));
            gameBroadcast("game_action", {action: "update_values", options:{updates: updates}});
            setKeypress({"w": false});
        } else {
            setKeypress({"w": cardId});
        }
    }
    else if (action === "detach") {
        if (cardIndex > 0) {
            gameBroadcast("game_action", {action: "detach", options: {card_id: card.id}})
            chatBroadcast("game_update", {message: "detached "+displayName+"."})
        }
    }
    // Increment token
    else if (action === "increment_token") {
        const tokenType = processTokenType(options.tokenType, card);
        const increment = options.increment;
        if (increment === 0) return;
        var words;
        if (increment === 1) words  = ["added", "token", "to"];
        if (increment >= 1) words   = ["added", "tokens", "to"];
        if (increment === -1) words = ["removed", "token", "from"];
        if (increment <= -1) words  = ["removed", "tokens", "from"];
        gameBroadcast("game_action", {action:"increment_token", options: {card_id: card.id, token_type: tokenType, increment: increment}});
        chatBroadcast("game_update",{message: words[0]+" "+Math.abs(increment)+" "+tokenPrintName(tokenType)+" "+words[1]+" "+words[2]+displayName+"."});
    }
    else if (action === "move_to_back") {
        const stack = game.stackById[stackId];
        const cardIds = stack.cardIds;
        const numCardIds = cardIds.length;
        if (numCardIds <= 1) return;
        gameBroadcast("game_action", {action: "move_card", options: {card_id: cardId, dest_group_id: groupId, dest_stack_index: stackIndex, dest_card_index: numCardIds-1, combine: true, preserve_state: false}})
    }
}

export const groupAction = (action, groupId, options, props) => {
    const {gameUi, playerN, gameBroadcast, chatBroadcast, activeCardAndLoc, setActiveCardAndLoc, dispatch, keypress, setKeypress, setObservingPlayerN} = props;
    if (!playerN) {
        alert("Please sit down to do that.")
        return;
    }
    if (!gameUi || !playerN || !groupId) return;
    if (action === "dealX") {
        var topX = options?.value || 0;
        const destGroupId = options?.destGroupId;
        if (!destGroupId) return;
        gameBroadcast("game_action", {action: "deal_x", options: {group_id: groupId, dest_group_id: destGroupId, top_x: topX}});
   }
}