import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BroadcastContext from '../../../contexts/BroadcastContext';
import { setKeypress } from '../../store/playerUiSlice';
import { useAddToken } from './useAddToken';
import { useDoActionList } from './useDoActionList';
import { useGameDefinition } from './useGameDefinition';

export const useKeyDown = () => {
    const gameDef = useGameDefinition();
    const dispatch = useDispatch();
    const keypressControl = useSelector(state => state?.playerUi?.keypress?.Control);
    const keypressShift = useSelector(state => state?.playerUi?.keypress?.Shift);
    const keypressAlt = useSelector(state => state?.playerUi?.keypress?.Alt);
    const mouseTopBottom = useSelector(state => state?.playerUi?.mouseTopBottom);
    const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
    const doActionList = useDoActionList();
    const addToken = useAddToken();
    console.log("gameb render keydown 1", gameBroadcast)

    return (event) => {
        event.preventDefault();
        const k = event.key;
        const unix_sec = Math.floor(Date.now() / 1000);
        if (k === "Alt") dispatch(setKeypress({"Alt": unix_sec}));
        if (k === " ") dispatch(setKeypress({"Space": unix_sec}));
        if (k === "Control") dispatch(setKeypress({"Control": unix_sec}));
        if (k === "Shift") dispatch(setKeypress({"Shift": unix_sec}));
        if (k === "Tab") dispatch(setKeypress({"Tab": unix_sec}));
        var dictKey = k.length === 1 ? k.toUpperCase() : k;
        //if ((unix_sec - keypressShift) < 30) dictKey = "Shift+"+dictKey;
        //if ((unix_sec - keypressControl) < 30) dictKey = "Ctrl+"+dictKey;
        //if ((unix_sec - keypressAlt) < 30) dictKey = "Alt+"+dictKey;
        if (keypressShift) dictKey = "Shift+" + dictKey;
        if (keypressControl) dictKey = "Ctrl+" + dictKey;
        if (keypressAlt) dictKey = "Alt+" + dictKey;

        for (var keyObj of gameDef?.hotkeys.token) {
            if (keyObj.key === dictKey) {
                addToken(keyObj.tokenType, mouseTopBottom === "top" ? 1 : -1);
                return;
            }
        }
        for (var keyObj of gameDef?.hotkeys.game) {
            console.log("keydown action check ",keyObj.key, dictKey)
            if (keyObj.key === dictKey) {
                doActionList(keyObj.actionListId)
                console.log("keydown action ",keyObj.actionListId, gameDef.actionLists[keyObj.actionListId])
                return;
            }
        }
        for (var keyObj of gameDef?.hotkeys.card) {
            if (keyObj.key === dictKey) {
                doActionList(keyObj.actionListId)
                console.log("keydown action ",keyObj.actionListId, gameDef.actionLists[keyObj.actionListId])
                return;
            }
        }
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