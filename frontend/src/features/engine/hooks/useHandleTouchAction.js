// Handle behavior when a card is touched/clicked

import { useState, useContext } from "react";
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { setMouseXY, setDropdownMenu, setTouchAction } from "../../store/playerUiSlice";
import store from "../../../store";
import BroadcastContext from "../../../contexts/BroadcastContext";
import { useDoActionList } from "./useDoActionList";
import { useGameDefinition } from "./useGameDefinition";
import { useGetDefaultAction } from "./useGetDefaultAction";
import { useDoDragnHotkey } from "./useDragnHotkeys";

export const useHandleTouchAction = () => {
    const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
    const dispatch = useDispatch();
    const gameDef = useGameDefinition();
    const playerN = useSelector(state => state?.playerUi?.playerN);
    const touchAction = useSelector(state => state?.playerUi?.touchAction);
    const activeCardId = useSelector(state => state?.playerUi?.activeCardId);
    const doActionList = useDoActionList();
    const doDragnHotkey = useDoDragnHotkey();
    const [prevActive, setPrevActive] = useState(null);
    const getDefaultAction = useGetDefaultAction();
    const state = store.getState();
    const actionProps = {state, dispatch, gameBroadcast, chatBroadcast};
    console.log("Rendering HandleTouchActions")
    return ((touchedCard) => {
        // Must be a player
        if (!playerN) return null;
        if (touchAction) {
            if (touchAction?.actionType === "game") {
                touchAction.isDragnButton ? doDragnHotkey(touchAction?.actionList) : doActionList(touchAction?.actionList);
                dispatch(setTouchAction(null));
            } else if (touchAction?.actionType === "token" && touchedCard) {
                const tokenType = touchAction?.tokenType;
                const increment = touchAction?.doubleClicked ? -1 : 1;
                const hasToken = touchedCard.tokens[tokenType] > 0;
                if (!hasToken && increment < 0 && gameDef["tokens"]?.[tokenType]?.modifier !== true) return; // Can't have negative non-modifier tokens
                const actionList = [
                    ["LOG", "$ALIAS_N", increment > 0 ? " added " : " removed ", Math.abs(increment), " ", gameDef["tokens"]?.[tokenType]?.name," token to ", "$ACTIVE_FACE.name", "."],
                    ["INCREASE_VAL", "/cardById/$ACTIVE_CARD_ID/tokens/" + tokenType, increment]
                ]
                doActionList(actionList);
                const tokensLeft = touchAction?.tokensLeft;
                if (tokensLeft >= 0) {
                    if (tokensLeft === 0) dispatch(setTouchAction(null));
                    else if (tokensLeft === 1 && hasToken) dispatch(setTouchAction(null));
                    else if (hasToken) {
                        dispatch(setTouchAction({...touchAction, tokensLeft: tokensLeft - 1}))
                    }
                }
            } else if (touchAction?.actionType === "card" && touchedCard) {
                touchAction.isDragnButton ? doDragnHotkey(touchAction?.actionList) : doActionList(touchAction?.actionList);
                dispatch(setMouseXY(null));
            }
            dispatch(setMouseXY(null));
            dispatch(setDropdownMenu(null));
        } else if (touchedCard.id === activeCardId) {
            // If a touched card is the active card, we do the default action
            const defaultAction = getDefaultAction(touchedCard.id);
            doActionList(defaultAction?.actionList)
            return;
        }
    })
}