
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
  getVisibleSide,
} from "./helpers";
import {
  listOfMatchingCards,
  formatCriteria,
  formatOptions
} from "../../../engine/functions/flatListOfCards";
import { setValues } from "../../../store/gameUiSlice";
import abilities from "../definitions/abilities";
import { GROUPSINFO, roundStepToText, nextRoundStep, prevRoundStep, nextPhase, prevPhase } from "../definitions/constants";
import { setActiveCardObj, setKeypressW, setObservingPlayerN, setPlayerUiValues } from "../../../store/playerUiSlice";


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

export const gameAction = (action, actionProps, forPlayerN = null) => {
    const {state, dispatch, gameBroadcast, chatBroadcast} = actionProps;
    const gameUi = state?.gameUi;
    const playerN = forPlayerN || state?.playerUi?.playerN;
    if (!playerN) {
        alert("Please sit down to do that.")
        return;
    }
    if (!state?.gameUi || !state?.playerUi) return;
    const game = gameUi.game;
    const isHost = playerN === leftmostNonEliminatedPlayerN(gameUi);
    const activeCardObj = state?.playerUi?.activeCardObj;
    if (action === "refresh") {
        const game = gameUi.game;
        const isHost = playerN === leftmostNonEliminatedPlayerN(gameUi);

        if (game.playerData[playerN].refreshed) {
            const result = window.confirm("Records show that you ("+playerNToPlayerSpaceN(playerN)+") have not triggered a new round since your last refresh. Refresh anyway?")
            //chatBroadcast("game_update", {message: "tried to refresh, but they already refreshed this round."})
            if (!result) return;
        }
        gameBroadcast("game_action", {action: "refresh", options: {for_player_n: playerN}})

        // The player in the leftmost non-eliminated seat is the only one that does the framework game actions.
        // This prevents, for example, the token moving multiple times if players refresh at different times.
        if (isHost) {
            // Set phase
            chatBroadcast("game_update", {message: "set the round step to "+roundStepToText("7.R")+"."})
            const firstPlayerN = game.firstPlayer;
            const nextPlayerN = getNextPlayerN(gameUi, firstPlayerN);
            // If nextPlayerN is null then it's a solo game, so don't pass the token
            if (nextPlayerN) {
                chatBroadcast("game_update",{message: "moved first player token to "+nextPlayerN+"."});
            }
        }
        // Refresh all cards you control
        chatBroadcast("game_update",{message: "refreshes."});
        // Raise your threat
        const newThreat = game.playerData[playerN].threat+1;
        chatBroadcast("game_update", {message: "raises threat by 1 ("+newThreat+")."});
    } 

    else if (action === "new_round") {

        const listOfActions =
        [
            { // Action 1: Change round step
                action: "conditions",
                conditions: [ 
                    { // if statement (is player 1)
                        if: [
                            [["playerUi", "playerN"], "equalTo", "player1"]
                        ],
                        then: [
                            {
                                action: "setValue", 
                                key_list: ["phase"], 
                                value: "Resource"
                            },
                            {
                                action: "setValue", 
                                key_list: ["roundStep"], 
                                value: "1.R"
                            },
                            {
                                action: "increaseBy", 
                                key_list: ["roundNumber"], 
                                value: 1,
                            },
                        ]
                    }
                ]
            },
            { // Action 2: Draw a card
                action: "moveStack", 
                stack_id: ["groupById", "playerIDeck", "stackIds", 0],
                dest_group_id: "playerIHand", 
                dest_stack_index: -1,
                combine: false,
            },
            { // Action 3: Resources on heroes
                action: "forEach",
                key_list: ["cardById"],
                action_list: [
                    {
                        if: [["controller", "playerI"]],
                        then: [
                            {
                                action: "increaseBy", 
                                key_list: ["tokens","resource"], 
                                value: 1,
                            },
                        ]
                    }
                ],
            }
        ]
        gameBroadcast("game_action", {
            action: "game_action_list", 
            options: {
                action_list: listOfActions, 
                player_ui: state.playerUi,
            }
        })

    //     # Change phase and round
    // is_host = player_n == leftmost_non_eliminated_player_n(gameui)
    // gameui = if is_host do
    //   update_values(gameui,[
    //     ["game", "phase", "Resource"],
    //     ["game", "roundStep", "1.R"],
    //     ["game", "roundNumber", gameui["game"]["roundNumber"]+1]
    //   ])
    // else
    //   gameui
    // end
    // # Draw card(s)
    // cards_per_round = gameui["game"]["playerData"][player_n]["cardsDrawn"]
    // gameui = if cards_per_round > 0 do Enum.reduce(1..cards_per_round, gameui, fn(n, acc) ->
    //     acc = draw_card(acc, player_n)
    //   end)
    // else
    //   gameui
    // end
    // # Add a resource to each hero
    // gameui = action_on_matching_cards(gameui, [
    //     ["sides","sideUp","type","Hero"],
    //     ["controller",player_n],
    //     ["groupType","play"]
    //   ],
    //   "increment_token",
    //   %{"token_type" => "resource", "increment" => 1}
    // )
    // # Reset willpower count and refresh status
    // gameui = update_values(gameui,[
    //   ["game", "playerData", player_n, "willpower", 0],
    //   ["game", "playerData", player_n, "refreshed", false]
    // ])
    // # Add custom set tokens per round
    // gameui = action_on_matching_cards(gameui, [
    //     ["controller",player_n],
    //     ["groupType","play"]
    //   ],
    //   "apply_tokens_per_round",
    //   %{}
    // );
    // if is_host do gameui = action_on_matching_cards(gameui, [
    //       ["controller","shared"],
    //       ["groupType","play"]
    //     ],
    //     "apply_tokens_per_round",
    //     %{}
    //   );
    // else
    //   gameui
    // end
    // # Uncommit all characters to the quest
    // gameui = action_on_matching_cards(gameui, [
    //     ["controller",player_n]
    //   ],
    //   "update_card_values",
    //   %{"updates" => [["committed", false]]}
    // );











    //     // Check if refresh is needed
    //     if (!game.playerData[playerN].refreshed) gameBroadcast("game_action", {action: "refresh_and_new_round", options: {for_player_n: playerN}})
    //     else gameBroadcast("game_action", {action: "new_round", options: {for_player_n: playerN}})

    //     // The player in the leftmost non-eliminated seat is the only one that does the framework game actions.
    //     // This prevents, for example, the round number increasing multiple times.
    //     if (isHost) {
    //         chatBroadcast("game_update", {message: "-----------------------"})
    //         chatBroadcast("game_update", {message: "-----------------------"})
    //         chatBroadcast("game_update", {message: "----------------------- New Round"})
    //         chatBroadcast("game_update", {message: "-----------------------"})
    //         chatBroadcast("game_update", {message: "-----------------------"})
    //         chatBroadcast("game_update", {message: "started a new round as host."})
    //         chatBroadcast("game_update", {message: "set the round step to "+roundStepToText("1.R")+"."})
    //         chatBroadcast("game_update",{message: "increased the round number by 1."})
    //     }
    //     chatBroadcast("game_update",{message: "drew card(s)."});
    //     chatBroadcast("game_update",{message: "saved the replay to their profile."});
    //     // Check for alerts
    //     checkAlerts();
    }

    else if (action === "new_round_all") {
        if (!areMultiplayerHotkeysEnabled(game,chatBroadcast)) return;
        for (var i=1; i<=game.numPlayers; i++) {
            const playerI = "player"+i;
            if (!game.playerData[playerI].eliminated) {
                chatBroadcast("game_update",{message: "triggers the new round action for "+playerNToPlayerSpaceN(playerI)});
                gameAction("new_round", actionProps, playerI);
            }
        }
    }

    else if (action === "refresh_all") {
        if (!areMultiplayerHotkeysEnabled(game,chatBroadcast)) return;
        for (var i=1; i<=game.numPlayers; i++) {
            const playerI = "player"+i;
            if (!game.playerData[playerI].eliminated) {
                chatBroadcast("game_update",{message: "triggers the refresh action for "+playerNToPlayerSpaceN(playerI)});
                gameAction("refresh", actionProps, playerI);
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
        gameBroadcast("game_action",{action: "draw_card", options: {for_player_n: playerN}});
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
            gameBroadcast("step_through", {action: "step_through", options: {size: "single", direction: "undo", preserve_undo: true}});
            chatBroadcast("game_update", {message: "pressed undo."});
            // Clear GiantCard
            dispatch(setActiveCardObj(null));
        }
    } 

    else if (action === "undo_many") {
        // Undo an action
        if (game.replayStep <= 0) {
            chatBroadcast("game_update", {message: "tried to undo an action, but no previous actions exist."});
        } else {
            gameBroadcast("step_through", {action: "step_through", options: {size: "round", direction: "undo", preserve_undo: true}});
            chatBroadcast("game_update", {message: "rewinds a round."});
            // Clear GiantCard
            dispatch(setActiveCardObj(null));
        }
    } 
    
    else if (action === "redo") {
        // Redo an action
        if (game.replayStep >= game.replayLength) {
            chatBroadcast("game_update", {message: "tried to redo an action, but the game is current."});
        } else {
            gameBroadcast("step_through", {action: "step_through", options: {size: "single", direction: "redo", preserve_undo: true}});
            chatBroadcast("game_update", {message: "pressed redo."});
            // Clear GiantCard
            dispatch(setActiveCardObj(null));
        }
    }
    
    else if (action === "redo_many") {
        // Redo an action
        if (game.replayStep >= game.replayLength) {
            chatBroadcast("game_update", {message: "tried to redo an action, but the game is current."});
        } else {
            gameBroadcast("step_through", {action: "step_through", options: {size: "round", direction: "redo", preserve_undo: true}});
            chatBroadcast("game_update", {message: "fast-forwards a round."});
            // Clear GiantCard
            dispatch(setActiveCardObj(null));
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
    else if (action === "caps_lock_n") {
        chatBroadcast("game_update",{message: "pressed N instead of Shift-N. Is caps lock on?"});
    }
    else if (action === "score") {
        const score = getScore(gameUi, gameBroadcast, chatBroadcast)
        chatBroadcast("game_update",{message: "calculated score: "+score});
    }
    else if (action === "increase_threat") {
        // Raise your threat
        const newThreat = game.playerData[playerN].threat+1;
        chatBroadcast("game_update", {message: "raises "+playerNToPlayerSpaceN(playerN)+"'s threat by 1 ("+newThreat+")."});
        gameBroadcast("game_action", {action: "increment_threat", options: {increment: 1, for_player_n: playerN}});
    }
    else if (action === "increase_threat_all") {
        if (!areMultiplayerHotkeysEnabled(game,chatBroadcast)) return;
        for (var i=1; i<=game.numPlayers; i++) {
            const playerI = "player"+i;
            if (!game.playerData[playerI].eliminated) {
                gameAction("increase_threat", actionProps, playerI);
            }
        }
    }
    else if (action === "decrease_threat") {
        // Raise your threat
        const newThreat = game.playerData[playerN].threat-1;
        chatBroadcast("game_update", {message: "reduces "+playerNToPlayerSpaceN(playerN)+"'s threat by 1 ("+newThreat+")."});
        gameBroadcast("game_action", {action: "increment_threat", options: {increment: -1, for_player_n: playerN}});
    }
    else if (action === "decrease_threat_all") {
        for (var i=1; i<=game.numPlayers; i++) {
            const playerI = "player"+i;
            if (!game.playerData[playerI].eliminated) {
                gameAction("decrease_threat", actionProps, playerI);
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
            dispatch(setObservingPlayerN(nextPlayerN));
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
            gameAction("draw", actionProps, nextPlayerN);
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
    //const {gameUi, playerN, gameBroadcast, chatBroadcast, activeCardObj, setActiveCardObj, dispatch, keypress, setKeypress, setObservingPlayerN} = props;
    const {state, dispatch, gameBroadcast, chatBroadcast} = props;
    const gameUi = state?.gameUi;
    const playerN = state?.playerUi?.playerN;
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
    const stack = game.stackById[stackId];
    const cardIds = stack.cardIds;
    const activeCardObj = state.playerUi?.activeCardObj;

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
        const listOfActions =
        [
            { // Action 1
                action: "conditions",
                conditions: [ 
                    { // if statement (card is ready)
                        if: [
                            [["cardById", ["playerUi", "activeCardId"], "sides", "sideUp", "type"], "equalTo", "Location"]
                        ],
                        then: [
                            {
                                action: "moveCard", 
                                card_id: ["playerUi", "activeCardId"],
                                dest_group_id: "sharedActive", 
                                dest_stack_index: 0, 
                                dest_card_index: 0,
                            },
                        ]
                    },
                    { // if statement (card is ready)
                        if: [
                            [["cardById", ["playerUi", "activeCardId"], "inPlay"], "equalTo", true],
                            [["cardById", ["playerUi", "activeCardId"], "exhausted"], "equalTo", false]
                        ],
                        then: [
                            {
                                action: "setValue", 
                                keylist: ["cardById", ["playerUi", "activeCardId"], "exhausted"], 
                                value: true
                            },
                            {
                                action: "setValue", 
                                keylist: ["cardById", ["playerUi", "activeCardId"], "rotation"], 
                                value: 90
                            }
                        ]
                    },
                    { // else if
                        if: [   
                            [["cardById", ["playerUi", "activeCardId"], "inPlay"], "equalTo", true],
                            [["cardById", ["playerUi", "activeCardId"], "exhausted"], "equalTo", true]
                        ],
                        then: [
                            {
                                action: "setValue", 
                                keylist: ["cardById", ["playerUi", "activeCardId"], "exhausted"], 
                                value: false
                            },
                            {
                                action: "setValue", 
                                keylist: ["cardById", ["playerUi", "activeCardId"], "rotation"], 
                                value: 0
                            }
                        ]
                    },
                ]
            }
        ]
        gameBroadcast("game_action", {
            action: "game_action_list", 
            options: {
                action_list: listOfActions, 
                player_ui: state.playerUi,
            }
        })


        // if (cardFace.type === "Location") {
        //     chatBroadcast("game_update", {message: "made "+displayName+" the active location."});
        //     gameBroadcast("game_action", {action: "move_stack", options: {stack_id: stackId, dest_group_id: "sharedActive", dest_stack_index: 0, combine: false, preserve_state: false}})
        //     dispatch(setActiveCardObj(null));
        // } else {
        //     var values = [true, 90];
        //     if (card.exhausted) {
        //         values = [false, 0];
        //         chatBroadcast("game_update", {message: "readied "+displayName+"."});
        //     } else {
        //         chatBroadcast("game_update", {message: "exhausted "+displayName+"."});
        //     }
        //     const updates = [["game", "cardById", cardId, "exhausted", values[0]], ["game", "cardById", cardId, "rotation", values[1]]];
        //     dispatch(setValues({updates: updates}));
        //     console.log("exhaust gameBroadcast", gameBroadcast)
        //     gameBroadcast("game_action", {action: "update_values", options:{updates: updates}});
        // }
    }
    // Flip card
    else if (action === "flip") {
        var newSide = "A";
        if (card["currentSide"] === "A") newSide = "B";
        const updates = [["game","cardById",cardId,"currentSide", newSide]]
        dispatch(setValues({updates: updates}))
        dispatch(setActiveCardObj({...activeCardObj, card: {...card, currentSide: newSide}, clicked: false}))
        gameBroadcast("game_action", {action: "flip_card", options:{card_id: cardId}});
        if (displayName==="player card" || displayName==="encounter card") {
            chatBroadcast("game_update", {message: "flipped "+getDisplayName(card)+" faceup."});
        } else {
            chatBroadcast("game_update", {message: "flipped "+displayName+" over."});
        }
    }
    else if (action === "commit" || action === "commit_without_exhausting") {
        /* const listOfActions =
        [
            [ // Action 1
                { // if statement (card is ready and not committed or exhausted)
                    def: {
                        "questStat": 
                    }
                    if: [   
                        [["cardById", ["id"], "groupType"], "equalTo", "play"], 
                        [["cardById", ["id"], "committed"], "equalTo", false],
                        [["cardById", ["id"], "exhausted"], "equalTo", false]
                    ],
                    then: [
                        [["cardById", ["id"], "committed"], "changeTo", true], 
                        [["cardById", ["id"], "exhausted"], "changeTo", true], 
                        [["cardById", ["id"], "rotation"],  "changeTo", 90],
                        [
                            { // if
                                if: [["game", "questMode"], "equalTo", "Battle"],
                                then: [
                                    [["playerData", ["controller"], "attack"], "increaseBy", ["sides","sideUp","attack"]],
                                    [["playerData", ["controller"], "attack"], "increaseBy", ["sides","sideUp","tokens","attack"]],
                                ]
                            },
                            { // else if
                                if: [["game", "questMode"], "equalTo", "Siege"],
                                then: [
                                    [["playerData", ["controller"], "defense"], "increaseBy", ["sides","sideUp","defense"]],
                                    [["playerData", ["controller"], "defense"], "increaseBy", ["sides","sideUp","tokens","defense"]],
                                ]
                            },
                            { // else
                                if: true,
                                then: [
                                    [["playerData", ["controller"], "willpower"], "increaseBy", ["sides","sideUp","willpower"]],
                                    [["playerData", ["controller"], "willpower"], "increaseBy", ["sides","sideUp","tokens","willpower"]],
                                ]
                            },
                        ]
                    ]
                },
                { // else if
                    if: [   
                        [["cardById", ["id"], "groupType"], "equalTo", "play"], 
                        [["cardById", ["id"], "committed"], "equalTo", true],
                        [["cardById", ["id"], "exhausted"], "equalTo", true]
                    ],
                    then: [
                        [["cardById", ["id"], "committed"], "changeTo", true], 
                        [["cardById", ["id"], "exhausted"], "changeTo", true], 
                        [["cardById", ["id"], "rotation"],  "changeTo", 90],
                        [
                            { // if
                                if: [["game", "questMode"], "equalTo", "Battle"],
                                then: [
                                    [["playerData", ["controller"], "attack"], "increaseBy", ["sides","sideUp","attack"]],
                                    [["playerData", ["controller"], "attack"], "increaseBy", ["sides","sideUp","tokens","attack"]],
                                ]
                            },
                            { // else if
                                if: [["game", "questMode"], "equalTo", "Siege"],
                                then: [
                                    [["playerData", ["controller"], "defense"], "increaseBy", ["sides","sideUp","defense"]],
                                    [["playerData", ["controller"], "defense"], "increaseBy", ["sides","sideUp","tokens","defense"]],
                                ]
                            },
                            { // else
                                if: true,
                                then: [
                                    [["playerData", ["controller"], "willpower"], "increaseBy", ["sides","sideUp","willpower"]],
                                    [["playerData", ["controller"], "willpower"], "increaseBy", ["sides","sideUp","tokens","willpower"]],
                                ]
                            },
                        ]
                    ]
                },
            ]
        ] */
        
        const playerController = card.controller;
        if (playerController === "shared") return;
        var questingStat = "willpower";
        if (game.questMode === "Battle") questingStat = "attack";
        if (game.questMode === "Siege")  questingStat = "defense";
        const delta = cardFace[questingStat] + card.tokens[questingStat];
        // Commit to quest and exhaust
        if (action === "commit" && groupType === "play" && !card["committed"] && !card["exhausted"]) {
            const updates = [
                ["game", "cardById", cardId, "committed", true], 
                ["game", "cardById", cardId, "exhausted", true], 
                ["game", "cardById", cardId, "rotation", 90],
            ];
            chatBroadcast("game_update", {message: "committed "+displayName+" to the quest."});
            gameBroadcast("game_action", {action:"increment_willpower", options: {increment: delta}});
            gameBroadcast("game_action", {action: "update_values", options:{updates: updates}});
        }
        // Commit to quest without exhausting
        else if (action === "commit_without_exhausting" && groupType === "play" && !card["committed"] && !card["exhausted"]) {
            const updates = [["game", "cardById", cardId, "committed", true]];
            chatBroadcast("game_update", {message: "committed "+displayName+" to the quest without exhausting."});
            gameBroadcast("game_action", {action:"increment_willpower", options: {increment: delta}});
            gameBroadcast("game_action", {action: "update_values", options:{updates: updates}});
        }
        // Uncommit to quest and ready
        else if (action === "commit" && groupType === "play" && card["committed"]) {
            const updates = [
                ["game", "cardById", cardId, "committed", false], 
                ["game", "cardById", cardId, "exhausted", false], 
                ["game", "cardById", cardId, "rotation", 0]
            ];
            chatBroadcast("game_update", {message: "uncommitted "+displayName+" to the quest."});
            if (card["exhausted"]) chatBroadcast("game_update", {message: "readied "+displayName+"."});
            gameBroadcast("game_action", {action:"increment_willpower", options: {increment: -delta}});
            gameBroadcast("game_action", {action: "update_values", options:{updates: updates}});
        }
        // Uncommit to quest without readying
        else if (action === "commit_without_exhausting" && groupType === "play" && card["committed"]) {
            const updates = [["game", "cardById", cardId, "committed", false]];
            chatBroadcast("game_update", {message: "uncommitted "+displayName+" to the quest."});
            gameBroadcast("game_action", {action:"increment_willpower", options: {increment: -delta}});
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
        dispatch(setActiveCardObj(null));
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
            for (var i=0; i<cardIds.length; i++) {
                const id = cardIds[i];
                const cardi = game.cardById[id];
                const discardGroupId = cardi["discardGroupId"];
                const encounterSet = cardi["cardEncounterSet"];
                if (["Search for the Horn"].includes(encounterSet)) discardGroupId = "sharedEncounterDiscard";
                const cardiFace = getCurrentFace(cardi);
                if ((cardiFace.keywords.includes("Guarded") || cardiFace.text.startsWith("Guarded"))
                    && i > 0
                    && cardi.rotation === 0) continue;
                chatBroadcast("game_update", {message: "discarded "+getDisplayName(cardi)+" to "+GROUPSINFO[discardGroupId].name+"."});
                gameBroadcast("game_action", {action: "move_card", options: {card_id: id, dest_group_id: discardGroupId, dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}})
            }
        // If the card is a child card in a stack, just discard that card
        } else {
            var discardGroupId = card["discardGroupId"];
            const encounterSet = card["cardEncounterSet"];
            if (["Search for the Horn"].includes(encounterSet)) discardGroupId = "sharedEncounterDiscard";
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
        dispatch(setActiveCardObj(null));
    }
    // Shufle card into owner's deck
    else if (action === "shuffle_into_deck") {
        // determine destination groupId
        const destGroupId = card.deckGroupId;
        gameBroadcast("game_action", {action: "move_card", options: {card_id: cardId, dest_group_id: destGroupId, dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}})
        gameBroadcast("game_action", {action: "shuffle_group", options: {group_id: destGroupId}})
        chatBroadcast("game_update", {message: "shuffled "+displayName+" from "+GROUPSINFO[groupId].name+" into "+GROUPSINFO[destGroupId].name+"."})
        // Clear GiantCard
        dispatch(setActiveCardObj(null));
    }
    // Draw an arrow
    else if (action === "draw_arrow") {
        // Determine if this is the start or end of the arrow
        const drawingArrowFrom = state?.playerUi?.keypress.w;
        if (drawingArrowFrom) {
            const drawingArrowTo = cardId;
            const oldArrows = game.playerData[playerN].arrows;
            const newArrows = oldArrows.concat([[drawingArrowFrom, drawingArrowTo]]);
            const updates = [["game", "playerData", playerN, "arrows", newArrows]];
            dispatch(setValues({updates: updates}));
            gameBroadcast("game_action", {action: "update_values", options:{updates: updates}});
            dispatch(setKeypressW(false));
        } else {
            dispatch(setKeypressW(cardId));
        }
    }
    // Detach a card
    else if (action === "detach") {
        if (cardIndex > 0) {
            gameBroadcast("game_action", {action: "detach", options: {card_id: card.id}})
            chatBroadcast("game_update", {message: "detached "+displayName+"."})
        }
    }
    // Swap attachment side
    else if (action === "swap_side") {
        if (cardIndex > 0) {
            const newDirection = card.attachmentDirection ? -card.attachmentDirection : -1;
            const updates = [["game", "cardById", cardId, "attachmentDirection", newDirection]];
            gameBroadcast("game_action", {action: "update_values", options:{updates: updates}});            
            gameBroadcast("game_action", {action: "move_card", options: {card_id: cardId, dest_group_id: groupId, dest_stack_index: stackIndex+1, dest_card_index: 0, combine: false, preserve_state: true}})
            gameBroadcast("game_action", {action: "move_card", options: {card_id: cardId, dest_group_id: groupId, dest_stack_index: stackIndex, dest_card_index: cardIndex, combine: true, preserve_state: true}})

        }
    }
    // Discard the other cards in a the stack
    else if (action === "detach_and_discard") { 
        const stack = getStackByCardId(game.stackById, cardId);
        if (!stack) return;
        const cardIds = stack.cardIds;
        for (var id of cardIds) {
            if (id === cardId) continue;
            const cardi = game.cardById[id];
            const discardGroupId = cardi["discardGroupId"];
            chatBroadcast("game_update", {message: "discarded "+getDisplayName(cardi)+" to "+GROUPSINFO[discardGroupId].name+"."});
            gameBroadcast("game_action", {action: "move_card", options: {card_id: id, dest_group_id: discardGroupId, dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}})
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
    else if (action === "card_ability") {
        const cardAbilities = abilities[card.cardDbId];
        if (!cardAbilities) {
            chatBroadcast("game_update",{message: "pressed Shift+A instead of A. Is caps lock on?"});
            return; 
        }// Card is not in ability database
        const visibleSide = getVisibleSide(card, playerN);
        const faceAbilities = cardAbilities[visibleSide];
        if (!faceAbilities) return; // Card face does not have abilities
        if (faceAbilities.length !== 1) return; // Card face does not have 1 ability
        const faceAbility = faceAbilities[0];
        var trigger = faceAbility.trigger;
        trigger = [...trigger,["id",card.id]]
        const matchingTrigger = listOfMatchingCards(gameUi, trigger);
        if (!matchingTrigger || matchingTrigger.length !== 1) return; // Card does not meet trigger condition
        const results = faceAbility.results;
        for (var result of results) {
            if (result.type === "card_action") {
                var criteria = result.criteria;
                if (criteria === "self") criteria = [["id", card.id]];
                if (criteria === "parent") criteria = [["stackId", stackId], ["cardIndex", 0]]
                criteria = formatCriteria(criteria, playerN, card.controller);
                gameBroadcast("game_action", {
                    action: "action_on_matching_cards", 
                    options: {
                        criteria: criteria, 
                        action: result.action, 
                        options: formatOptions(result.options, playerN, card.controller)
                    }
                });
            } else if (result.type === "game_action") {
                gameBroadcast("game_action",{action: result.action, options: formatOptions(result.options, playerN, card.controller)});
            } else if (result.type === "ui_action") {
                const options = formatOptions(result.options, playerN, card.controller);
                dispatch(setPlayerUiValues({updates: options.updates}));
            }
        }
        chatBroadcast("game_update", {message: "triggered an ability on "+displayName+"."});
    }
}

export const groupAction = (action, groupId, options, actionProps) => {
    const {state, dispatch, gameBroadcast, chatBroadcast} = actionProps;
    if (!state?.playerUi?.playerN) {
        alert("Please sit down to do that.")
        return;
    }
    if (!state?.gameUi || !groupId) return;
    if (action === "dealX") {
        var topX = options?.value || 0;
        const destGroupId = options?.destGroupId;
        if (!destGroupId) return;
        gameBroadcast("game_action", {action: "deal_x", options: {group_id: groupId, dest_group_id: destGroupId, top_x: topX}});
   }
}
