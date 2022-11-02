// Handle behavior when a card is touched/clicked

import React, { useState, useContext } from "react";
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { cardAction } from "../../plugins/lotrlcg/functions/actions";
import { getDefault } from "../../plugins/lotrlcg/functions/helpers";
import { setActiveCardObj, setDropdownMenuObj, setTouchAction } from "../../store/playerUiSlice";
import store from "../../../store";
import BroadcastContext from "../../../contexts/BroadcastContext";
import { useDoActionList } from "./useDoActionList";
import { useGameDefinition } from "./useGameDefinition";
import { useGetDefaultAction } from "./useGetDefaultAction";

export const useHandleTouchAction = () => {
    const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
    const dispatch = useDispatch();
    const gameDef = useGameDefinition();
//    const gameUi = useSelector(state => state?.gameUi);
    const playerN = useSelector(state => state?.playerUi?.playerN);
    const touchMode = useSelector(state => state?.playerUi?.touchMode);
    const touchAction = useSelector(state => state?.playerUi?.touchAction);
    const activeCardObj = useSelector(state => state?.playerUi?.activeCardObj);
    const doActionList = useDoActionList();
/*     var activeCardGameUi = null;
    if (activeCardObj?.card) activeCardGameUi = gameUi.game.cardById[activeCardObj.card.id]; */
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
                doActionList(touchAction?.actionListId)
                dispatch(setTouchAction(null));
            } else if (touchAction?.actionType === "token" && touchedCard) {
                const tokenType = touchAction?.tokenType;
                const increment = touchAction?.doubleClicked ? -1 : 1;
                const hasToken = touchedCard.tokens[tokenType] > 0;
                if (!hasToken && increment < 0 && gameDef["tokens"]?.[tokenType]?.modifier !== true) return; // Can't have negative non-modifier tokens
                const actionList = [
                    ["GAME_INCREASE_VAL", "$ACTIVE_TOKENS_PATH", tokenType, increment],
                    ["GAME_ADD_MESSAGE", "$PLAYER_N", increment > 0 ? " added " : " removed ", Math.abs(increment), " ", gameDef["tokens"]?.[tokenType]?.name," token to ", "$ACTIVE_FACE.name", "."]
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
                doActionList(touchAction?.actionListId)
                dispatch(setActiveCardObj(null));
            }
            dispatch(setActiveCardObj(null));
            dispatch(setDropdownMenuObj(null));
        } else if (touchedCard.id === activeCardObj?.card?.id) {
            // If a touched card is the active card, we do the default action
            //alert(activeCardObj?.defaultAction?.actionListId)
            const defaultAction = getDefaultAction(touchedCard.id);
            console.log("active card xyz", defaultAction)

            doActionList(defaultAction?.actionListId)
            return;
            if (touchAction) return;
            // If there is no active card, also make sure previous active card is blanked
            if (!activeCardObj && prevActive?.setIsActive) prevActive.setIsActive(false);
            // Make sure touch mode is on before doing default actions 
            if (!touchMode) return;
            const sameAsPrev = touchedCard.id && touchedCard.id === prevActive?.card?.id;
            // If card was already active, perform default function
            if (sameAsPrev && activeCardObj?.clicked) {
                const activeCard = activeCardObj.card;
                const defaultAction = getDefault(activeCard, touchedCard.groupId, touchedCard.groupType, touchedCard.cardIndex);
                if (activeCard && defaultAction) cardAction(defaultAction.action, activeCard.id, defaultAction.options, actionProps);
            } else {
                setPrevActive(activeCardObj)
            }
        }
    })
}