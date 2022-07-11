import { useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { 
    getDisplayName,
    processTokenType,
    tokenPrintName,
} from "../functions/helpers";
import { gameAction, cardAction } from "../functions/actions";
import store from "../../../../store";
import { setCardSizeFactor, setKeypressAlt, setKeypressControl, setKeypressShift, setKeypressSpace, setKeypressTab } from "../../../store/playerUiSlice";
import { setValues } from "../../../store/gameUiSlice";
import BroadcastContext from "../../../../contexts/BroadcastContext";
import { useGameDefinition } from "../../../engine/functions/useGameDefinition";
import { useDoActionList } from "../../../engine/functions/useDoActionList";

// const keyTokenMap: { [id: string] : Array<string | number>; } = {

const hotkeys = {
    "ui": {
        "+": "increase_card_size",
        "-": "decrease_card_size",
    },
    "game": {
        "D": "draw",
        "E": "reveal",
        "Shift+E": "reveal_facedown",
        "K": "reveal_second",
        "Shift+K": "reveal_second_facedown",
        "Shift+R": "refresh",
        "Shift+N": "new_round",
        "Shift+P": "save",
        "Shift+S": "shadows",
        "Shift+X": "discard_shadows",
        "N": "caps_lock_n",
        "ArrowLeft": "undo",
        "ArrowRight": "redo",
        "ArrowDown": "next_step",
        "ArrowUp": "prev_step",
        "Shift+M": "mulligan",
        "Escape": "clear_targets",
        "Shift+O": "score",
        "U": "increase_threat",
        "J": "decrease_threat",
        "Shift+W": "next_seat",
        "Shift+D": "draw_next_seat",
        "Ctrl+Shift+R": "refresh_all",
        "Ctrl+Shift+N": "new_round_all",
        "Ctrl+U": "increase_threat_all",
        "Ctrl+J": "decrease_threat_all",
        "Ctrl+Z": "undo",
        "Ctrl+Y": "redo",
        "Ctrl+ArrowLeft": "undo_many",
        "Ctrl+ArrowRight": "redo_many",
        "Ctrl+ArrowUp": "prev_phase",
        "Ctrl+ArrowDown": "next_phase",
        "Alt+Shift+N": "new_round_all",
        "Alt+Shift+R": "refresh_all",
    },
    "card": {
        "0": "zero_tokens",
        "A": "toggle_exhaust",
        "F": "flip",
        "Q": "commit",
        "H": "shuffle_into_deck",
        "W": "draw_arrow",
        "Shift+Q": "commit_without_exhausting",
        "S": "deal_shadow",
        "T": "target",
        "V": "victory",
        "X": "discard",
        "C": "detach",
        "Shift+C": "detach_and_discard",
        "B": "move_to_back",
        "Shift+A": "card_ability",
    },
    "token": {
        "1": "resource",
        "2": "progress",
        "3": "damage",
        "4": "time",
        "5": "willpowerThreat",
        "6": "attack",
        "7": "defense",
        "8": "hitPoints",
    }
}

const keyUiMap = {
    "+": "increase_card_size",
    "-": "decrease_card_size",
}

const keyCardActionMap = {
    "0": "zero_tokens",
    "a": "toggle_exhaust",
    "f": "flip",
    "q": "commit",
    "h": "shuffle_into_deck",
    "w": "draw_arrow",
    "Q": "commit_without_exhausting",
    "s": "deal_shadow",
    "t": "target",
    "v": "victory",
    "x": "discard",
    "c": "detach",
    "C": "detach_and_discard",
    "b": "move_to_back",
    "A": "card_ability",
}

const keyGameActionMap = {
    "d": "draw",
    "e": "reveal",
    "E": "reveal_facedown",
    "k": "reveal_second",
    "K": "reveal_second_facedown",
    "R": "refresh",
    "N": "new_round",
    "P": "save",
    "S": "shadows",
    "X": "discard_shadows",
    "n": "caps_lock_n",
    "ArrowLeft": "undo",
    "ArrowRight": "redo",
    "ArrowDown": "next_step",
    "ArrowUp": "prev_step",
    "M": "mulligan",
    "Escape": "clear_targets",
    "O": "score",
    "u": "increase_threat",
    "j": "decrease_threat",
    "W": "next_seat",
    "D": "draw_next_seat",
    "L": "multiplayer_hotkeys"
}

const ctrlKeyGameActionMap = {
    "R": "refresh_all",
    "N": "new_round_all",
    "u": "increase_threat_all",
    "j": "decrease_threat_all",
    "z": "undo",
    "y": "redo",
    "ArrowLeft": "undo_many",
    "ArrowRight": "redo_many",
    "ArrowUp": "prev_phase",
    "ArrowDown": "next_phase",
}

const altKeyGameActionMap = {
    "N": "new_round_all",
    "R": "refresh_all",
}

const keyTokenMap = {
  "1": "resource",
  "2": "progress",
  "3": "damage",
  "4": "time",
  "5": "willpowerThreat",
  "6": "attack",
  "7": "defense",
  "8": "hitPoints",
}

const keyDefaultList = ["F11"];

var delayBroadcast;

export const HandleKeyDown = ({}) => {
    const dispatch = useDispatch();
    const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
    const gameDef = useGameDefinition();
    const doActionList = useDoActionList();
    const typing = useSelector(state => state?.playerUi?.typing);
    const keypressControl = useSelector(state => state?.playerUi?.keypress?.Control);
    const keypressShift = useSelector(state => state?.playerUi?.keypress?.Shift);
    const keypressAlt = useSelector(state => state?.playerUi?.keypress?.Alt);
    const [keyBackLog, setKeyBackLog] = useState({});
    console.log("Rendering HandleKeyDown")

    const keyUiAction = (action, actionProps) => {
        const {state, dispatch, gameBroadcast, chatBroadcast} = actionProps; 
        const cardSizeFactor = state.playerUi.cardSizeFactor;
        if (action === "increase_card_size") {
            dispatch(setCardSizeFactor(cardSizeFactor*1.1));
        }
        else if (action === "decrease_card_size") {
            dispatch(setCardSizeFactor(cardSizeFactor/1.1));
        }
    }

    const keyTokenAction = (rawTokenType) => {

        const game = state?.gameUi?.game;
        const activeCardObj = state?.playerUi?.activeCardObj;
        const playerN = state?.playerUi?.playerN;
        if (!game || !playerN || !activeCardObj || !activeCardObj.card) return; 
        const activeCardId = state.playerUi.activeCardObj.card.id; 
        const activeCard = game.cardById[activeCardId];    
        const tokenType = processTokenType(rawTokenType, activeCard);
        // Check if mouse is hoving over top half or bottom half of card
        // Top half will increase tokens, bottom half will decrease
        const mousePosition = activeCardObj.mousePosition;
        var delta = (mousePosition === "top" ? 1 : -1)
        const currentVal = game.cardById[activeCardId].tokens[tokenType];
        var newVal = currentVal + delta;
        if (newVal < 0 && ['resource','damage','progress','time'].includes(tokenType)) return;   
    
        // Increment token 
        var newKeyBackLog;
        if (!keyBackLog[activeCardId]) {
            newKeyBackLog = {
                ...keyBackLog,
                [activeCardId]: {
                    [tokenType]: delta
                }
            }
        } else if (!keyBackLog[activeCardId][tokenType]) {
            newKeyBackLog = {
                ...keyBackLog,
                [activeCardId]: {
                    ...keyBackLog[activeCardId],
                    [tokenType]: delta
                }
            }
        } else {
            newKeyBackLog = {
                ...keyBackLog,
                [activeCardId]: {
                    ...keyBackLog[activeCardId],
                    [tokenType]: keyBackLog[activeCardId][tokenType] + delta
                }
            }
        }
        setKeyBackLog(newKeyBackLog);
        const updates = [["cardById",activeCardId,"tokens", tokenType, newVal]];
        dispatch(setValues({updates: updates}))
        if (delayBroadcast) clearTimeout(delayBroadcast);
        delayBroadcast = setTimeout(function() {
            const incrementObject = {};
            Object.keys(newKeyBackLog).map((cardId, index) => {
                const cardKeyBackLog = newKeyBackLog[cardId];
                incrementObject[cardId] = cardKeyBackLog;
                const thisDisplayName = getDisplayName(game.cardById[cardId])
                Object.keys(cardKeyBackLog).map((tok, index) => {
                    if (tok === "displayName") return;

                    if (totalDelta === 0) return;
                    const state = store.getState();
                    const listOfActions = 
                    [
                        {
                            "_ACTION": "SET_VALUE",
                            "_PATH": ["_ACTIVE_CARD", "tokens", tokenType],
                            "_VALUE": newAmount,
                            "_MESSAGES": [["{playerN} ", totalDelta >= 0 ? "added " : "removed ", Math.abs(totalDelta), " ", tokenType, " token",
                               Math.abs(totalDelta) > 1 ? "s" : "", totalDelta >= 0 ? " to " : " from ", ["_ACTIVE_FACE", "name"], "."]]
                        }
                    ]
                    doActionList("_custom", listOfActions);

                    const val = cardKeyBackLog[tok]; 
                    if (val > 0) {
                        if (val === 1) {
                            chatBroadcast("game_update",{message: "added "+val+" "+tokenPrintName(tok)+" token to "+thisDisplayName+"."});
                        } else {
                            chatBroadcast("game_update",{message: "added "+val+" "+tokenPrintName(tok)+" tokens to "+thisDisplayName+"."});
                        }
                    } else if (val < 0) {
                        if (val === -1) {
                            chatBroadcast("game_update",{message: "removed "+(-val)+" "+tokenPrintName(tok)+" token from "+thisDisplayName+"."});
                        } else {
                            chatBroadcast("game_update",{message: "removed "+(-val)+" "+tokenPrintName(tok)+" tokens from "+thisDisplayName+"."});
                        }                
                    }
                })
                //gameBroadcast("game_action", {action:"increment_tokens", options: {card_id: cardId, token_increments: cardKeyBackLog}});
                // Adjust willpower if committed
                if (activeCard.committed && cardKeyBackLog["willpower"] !== null) gameBroadcast("game_action", {action:"increment_willpower", options: {increment: cardKeyBackLog["willpower"], for_player_n: activeCard.controller}});
            })
            setKeyBackLog({})
            gameBroadcast("game_action", {action:"increment_tokens_object", options: {increment_object: incrementObject}});

        }, 500);
    }

    useEffect(() => {

        console.log("Rendering HandleKeyDown useEffect")
        const onKeyDown = (event) => {
            if (typing) return;
            else if (keyDefaultList.includes(event.key)) return;
            else {
                event.preventDefault();
                const state = store.getState();
                handleKeyDown(state,event);
            }
        }

        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
        }
    }, [keyBackLog, typing, keypressAlt, gameBroadcast, chatBroadcast, keypressControl, keypressShift]);

    const handleKeyDown = (
        state,
        event,
    ) => {
        console.log("handleKeyDown triggered")
        const k = event.key;
        if (!state?.playerUi?.playerN && !Object.keys(keyUiMap).includes(k)) {
            alert("Please sit down to do that.")
            return;
        }
        if (k === "CapsLock") alert("Warning: Caps Lock interferes with game hotkeys.")
        console.log(k);

        // Keep track of held key
        //if (k === "Shift") setKeypress({...keypress, "Shift": true});
        const unix_sec = Math.floor(Date.now() / 1000);
        if (k === "Control") dispatch(setKeypressControl(unix_sec));
        if (k === "Shift") dispatch(setKeypressShift(unix_sec));
        if (k === "Alt") dispatch(setKeypressAlt(unix_sec));
        if (k === "Tab") dispatch(setKeypressTab(unix_sec));
        if (k === " ") dispatch(setKeypressSpace(unix_sec));
        //else setKeypress({"Control": false});
        const actionProps = {state, dispatch, gameBroadcast, chatBroadcast};

        // Hotkeys
        console.log("ctrl",(unix_sec - keypressControl))
        var dictKey = k.toUpperCase();
        if ((unix_sec - keypressShift) < 30) dictKey = "Shift+"+dictKey;
        if ((unix_sec - keypressShift) < 30) dictKey = "Ctrl+"+dictKey;
        if ((unix_sec - keypressShift) < 30) dictKey = "Alt+"+dictKey;
        if (Object.keys(hotkeys["card"].includes(dictKey))) doActionList(hotkeys["card"][dictKey]);
        else if (Object.keys(hotkeys["ui"].includes(dictKey))) doActionList(hotkeys["ui"][dictKey]);
        else if (Object.keys(hotkeys["game"].includes(dictKey))) doActionList(hotkeys["game"][dictKey]);
        else if (Object.keys(hotkeys["token"].includes(dictKey))) keyTokenAction(hotkeys["token"][dictKey]);


/*         if ((unix_sec - keypressControl) < 30 && Object.keys(ctrlKeyGameActionMap).includes(k)) gameAction(ctrlKeyGameActionMap[k], actionProps);
        else if ((unix_sec - keypressAlt) < 30 && Object.keys(altKeyGameActionMap).includes(k)) gameAction(altKeyGameActionMap[k], actionProps);
        // else if (keypress["Shift"] && Object.keys(shiftKeyGameActionMap).includes(k)) gameAction(shiftKeyGameActionMap[k], actionProps);
        else if (Object.keys(keyGameActionMap).includes(k)) gameAction(keyGameActionMap[k], actionProps);
        else if (Object.keys(keyCardActionMap).includes(k)) cardAction(keyCardActionMap[k], state?.playerUi?.activeCardObj?.card.id, {}, actionProps);
        else if (Object.keys(keyTokenMap).includes(k)) keyTokenAction(keyTokenMap[k], actionProps);
        else if (Object.keys(keyUiMap).includes(k)) keyUiAction(keyUiMap[k], actionProps); */
    }

    return (null);

}


