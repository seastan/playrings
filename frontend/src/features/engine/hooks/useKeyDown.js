import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BroadcastContext from '../../../contexts/BroadcastContext';
import { setKeypress, setKeypressAlt, setKeypressControl, setKeypressShift, setKeypressSpace, setKeypressTab, setPreHotkeyActiveCardGroupId } from '../../store/playerUiSlice';
import { useAddToken } from './useAddToken';
import { useDoActionList } from './useDoActionList';
import { dragnHotkeys, useDoDragnHotkey } from './useDragnHotkeys';
import { useGameDefinition } from './useGameDefinition';
import { useActiveCardId } from './useActiveCardId';
import { useSendLocalMessage } from './useSendLocalMessage';
import { usePlayerN } from './usePlayerN';


export const useKeyDown = () => {
    const gameDef = useGameDefinition();
    const dispatch = useDispatch();
    
    const keypress = useSelector(state => state?.playerUi?.keypress);
    const keypressControl = keypress?.Control;
    const keypressShift = keypress?.Shift;
    const keypressAlt = keypress?.Alt;
    const mouseTopBottom = useSelector(state => state?.playerUi?.mouseTopBottom);
    const playerN = usePlayerN();
    const activeCardId = useActiveCardId();
    const activeCardGroupId = useSelector(state => state?.gameUi?.game?.cardById?.[activeCardId]?.groupId);
    const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
    const doActionList = useDoActionList();
    const doDragnHotkey = useDoDragnHotkey()
    const addToken = useAddToken();
    const sendLocalMessage = useSendLocalMessage();
    console.log("gameb render keydown 1", gameBroadcast)

    return (event) => {
        event.preventDefault();
        if (!playerN) {
            sendLocalMessage("You must be logged in and seated at the table to use hotkeys.");   
            return;
        }
        const k = event.key;
        const unix_sec = Math.floor(Date.now() / 1000);
        if (k === "Alt") dispatch(setKeypressAlt(unix_sec));
        if (k === " ") dispatch(setKeypressSpace(unix_sec));
        if (k === "Control") dispatch(setKeypressControl(unix_sec));
        if (k === "Shift") dispatch(setKeypressShift(unix_sec));
        if (k === "Tab") dispatch(setKeypressTab(unix_sec));
        if (["Alt", " ", "Control", "Shift", "Tab"].includes(k)) return;

        var dictKey = k.length === 1 ? k.toUpperCase() : k;
        //if ((unix_sec - keypressShift) < 30) dictKey = "Shift+"+dictKey;
        //if ((unix_sec - keypressControl) < 30) dictKey = "Ctrl+"+dictKey;
        //if ((unix_sec - keypressAlt) < 30) dictKey = "Alt+"+dictKey;
        if (Math.abs(keypressShift-unix_sec) < 5) {
            dictKey = "Shift+" + dictKey;
        }
        if (Math.abs(keypressControl-unix_sec) < 5) {
            dictKey = "Ctrl+" + dictKey;
        }
        if (Math.abs(keypressAlt-unix_sec) < 5) {
            dictKey = "Alt+" + dictKey;
        } 
        console.log("keypressdict", {keypressShift, keypressControl, keypressAlt, dictKey})

        for (var keyObj of gameDef?.hotkeys.token) {
            if (keyMatch(keyObj.key, dictKey)) {
                if (!activeCardId) {
                    sendLocalMessage(`You must hover over a card to use the "${dictKey}" hotkey.`);
                    return;
                }
                addToken(keyObj.tokenType, mouseTopBottom === "top" ? 1 : -1);
                return;
            }
        }
        for (var keyObj of gameDef?.hotkeys.game) {
            console.log("keydown action check ",keyObj.key, dictKey)
            if (keyMatch(keyObj.key, dictKey)) {
                doActionList(keyObj.actionList)
                console.log("keydown action ",keyObj.actionList, gameDef.actionLists[keyObj.actionList])
                return;
            }
        }
        for (var keyObj of gameDef?.hotkeys.card) {
            if (keyMatch(keyObj.key, dictKey)) {
                if (!activeCardId) {
                    sendLocalMessage(`You must hover over a card to use the "${dictKey}" hotkey.`);
                    return;
                }
                doActionList(keyObj.actionList)
                dispatch(setPreHotkeyActiveCardGroupId(activeCardGroupId));
                console.log("keydown action ",keyObj.actionList, gameDef.actionLists[keyObj.actionList])
                return;
            }
        }
        for (var keyObj of dragnHotkeys) {
            if (keyObj.key === dictKey) {
                doDragnHotkey(keyObj.actionList)
                console.log("keydown action ",keyObj.actionList, gameDef.actionLists[keyObj.actionList])
                return;
            }
        }

        sendLocalMessage(`No hotkey found for "${dictKey}".`)

        //if (Object.keys(defaultHotkeys["card"]).includes(dictKey)) doActionList("_custom",defaultActionLists[defaultHotkeys["card"][dictKey]]);
        //else if (Object.keys(defaultHotkeys["ui"]).includes(dictKey)) doActionList("_custom",defaultActionLists[defaultHotkeys["ui"][dictKey]]);
        //else if (Object.keys(defaultHotkeys["game"]).includes(dictKey)) doActionList("_custom",defaultActionLists[defaultHotkeys["game"][dictKey]]);
        //else if (Object.keys(defaultHotkeys["token"]).includes(dictKey)) keyTokenAction(defaultHotkeys["token"][dictKey]);
    }

/*     return (actionListName, actionList = null, _options = null) => {
        const state = store.getState();
        if (Object.keys(gameDef.actionLists).includes(actionListName)) {
            actionList = gameDef.actionLists[actionListName]
        } else if (actionListName === "flipCard") {
            actionList = flipCard;
        }
        if (actionList != null) gameBroadcast("game_action", {
            action: "game_action_list", 
            options: {
                action_list: actionList, 
                player_ui: state.playerUi,
            }
        })
    } */
}

const keyMatch = (key1, key2) => {
    if (key1 === key2) return true;
    if (key1.split('+').sort().join('+') === key2.split('+').sort().join('+')) return true;
    return false;
}