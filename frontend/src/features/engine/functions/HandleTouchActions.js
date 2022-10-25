import React, { useState, useEffect, useContext } from "react";
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { gameAction, cardAction } from "../../plugins/lotrlcg/functions/actions";
import { getDefault, getDisplayName, processTokenType, tokenPrintName } from "../../plugins/lotrlcg/functions/helpers";
import { setActiveCardObj, setDropdownMenuObj, setTouchAction } from "../../store/playerUiSlice";
import store from "../../../store";
import BroadcastContext from "../../../contexts/BroadcastContext";
import { useDoActionList } from "./useDoActionList";
import { useGameDefinition } from "./useGameDefinition";

export const HandleTouchActions = React.memo(({}) => {
    const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
    const dispatch = useDispatch();
    const gameDef = useGameDefinition();
//    const gameUi = useSelector(state => state?.gameUi);
    const playerN = useSelector(state => state?.playerUi?.playerN);
    const touchMode = useSelector(state => state?.playerUi?.touchMode);
    const touchAction = useSelector(state => state?.playerUi?.touchAction);
    const activeCardObj = useSelector(state => state?.playerUi?.activeCardObj);
    const dropdownMenuObj = useSelector(state => state?.playerUi?.dropdownMenuObj);
    const doActionList = useDoActionList();
/*     var activeCardGameUi = null;
    if (activeCardObj?.card) activeCardGameUi = gameUi.game.cardById[activeCardObj.card.id]; */
    const [currentDropdownMenuCardId, setCurrentDropdownMenuCardId] = useState(null);
    const [prevActive, setPrevActive] = useState(null);
    const state = store.getState();
    const actionProps = {state, dispatch, gameBroadcast, chatBroadcast};
    console.log("Rendering HandleTouchActions")

    useEffect(() => {
        if (!playerN) return;
        //alert(touchAction?.actionListId)
        if (touchAction?.actionType === "game") {
            const action = touchAction?.action;
            doActionList(touchAction?.actionListId)
            dispatch(setTouchAction(null));
        } else if (touchAction?.actionType === "token" && activeCardObj?.card) {
            const tokenType = touchAction?.tokenType;
            const increment = touchAction?.doubleClicked ? -1 : 1;
            const hasToken = activeCardObj?.card?.tokens[tokenType] > 0;
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
        } else if (touchAction?.actionType === "card" && activeCardObj?.card) {
            doActionList(touchAction?.actionListId)
            dispatch(setActiveCardObj(null));
        }
    }, [activeCardObj, touchAction, playerN]);

    useEffect(() => {
        if (dropdownMenuObj?.visible === false && dropdownMenuObj?.card?.id === currentDropdownMenuCardId) {
            dispatch(setDropdownMenuObj({...dropdownMenuObj, visible: true}));
        } else {
            setCurrentDropdownMenuCardId(dropdownMenuObj?.card?.id);
        }
    }, [dropdownMenuObj]);

    useEffect(() => {
        dispatch(setActiveCardObj(null));
        dispatch(setDropdownMenuObj(null));
    }, [touchAction])

    // Tapping on an already active card makes it perform the default action
    useEffect(() => {
        // If a touchAction is defined, we do not do the default action
        if (touchAction) return;
        // If there is no active card, also make sure previous active card is blanked
        if (!activeCardObj && prevActive?.setIsActive) prevActive.setIsActive(false);
        // Make sure touch mode is on before doing default actions 
        if (!touchMode) return;
        const sameAsPrev = activeCardObj?.card?.id && activeCardObj?.card?.id === prevActive?.card?.id;
        // If card was already active, perform default function
        if (sameAsPrev && activeCardObj?.clicked) {
            const activeCard = activeCardObj.card;
            const defaultAction = getDefault(activeCard, activeCardObj.groupId, activeCardObj.groupType, activeCardObj.cardIndex);
            if (activeCard && defaultAction) cardAction(defaultAction.action, activeCard.id, defaultAction.options, actionProps);
        } else {
            setPrevActive(activeCardObj)
        }

        // Add card highlight if no touch action is selected
        if (!touchAction) {
            if (activeCardObj?.setIsActive) activeCardObj.setIsActive(true);
            if (!sameAsPrev && prevActive?.setIsActive) prevActive.setIsActive(false);
        }
    }, [touchAction, activeCardObj, touchMode])

    return null;
})