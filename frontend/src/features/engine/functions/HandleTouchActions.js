import React, { useState, useEffect } from "react";
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { gameAction, cardAction } from "../../plugins/lotrlcg/functions/actions";
import { getDefault, getDisplayName, processTokenType, tokenPrintName } from "../../plugins/lotrlcg/functions/helpers";
import { setActiveCardObj, setDropdownMenuObj, setTouchAction } from "../../store/playerUiSlice";
import store from "../../../store";

export const HandleTouchActions = React.memo(({
    gameBroadcast, 
    chatBroadcast
}) => {
    const dispatch = useDispatch();
    const gameUi = useSelector(state => state?.gameUi);
    const playerN = useSelector(state => state?.playerUi?.playerN);
    const touchMode = useSelector(state => state?.playerUi?.touchMode);
    const touchAction = useSelector(state => state?.playerUi?.touchAction);
    const activeCardObj = useSelector(state => state?.playerUi?.activeCardObj);
    const dropdownMenuObj = useSelector(state => state?.playerUi?.dropdownMenuObj);
/*     var activeCardGameUi = null;
    if (activeCardObj?.card) activeCardGameUi = gameUi.game.cardById[activeCardObj.card.id]; */
    const [currentDropdownMenuCardId, setCurrentDropdownMenuCardId] = useState(null);
    const [prevActive, setPrevActive] = useState(null);
    const state = store.getState();
    const actionProps = {state, dispatch, gameBroadcast, chatBroadcast};
    console.log("Rendering HandleTouchActions")

    useEffect(() => {
        if (!playerN) return;
        if (touchAction?.type === "game") {
            const action = touchAction?.action;
            gameAction(action, actionProps)
            dispatch(setTouchAction(null));
        } else if (touchAction?.type === "card" && activeCardObj?.card) {
            const action = touchAction.action;
            const activeCard = activeCardObj.card;
            if (action === "increment_token") {
                const options = touchAction.options;
                const tokenType = processTokenType(options.tokenType, activeCard);
                const increment = options.increment;
                const hasToken = activeCard.tokens[tokenType] > 0;
                gameBroadcast("game_action", {action:"increment_token", options: {card_id: activeCard.id, token_type: tokenType, increment: increment}});
                if (increment > 0) chatBroadcast("game_update",{message: "added "+increment+" "+tokenPrintName(tokenType)+" token to "+getDisplayName(activeCard)+"."});
                if (increment < 0 && hasToken) chatBroadcast("game_update",{message: "removed "+Math.abs(increment)+" "+tokenPrintName(tokenType)+" token from "+getDisplayName(activeCard)+"."});
                const tokensLeft = touchAction.options?.tokensLeft;
                if (tokensLeft >= 0) {
                    if (tokensLeft === 0) dispatch(setTouchAction(null));
                    else if (tokensLeft === 1 && hasToken)  dispatch(setTouchAction(null));
                    else if (hasToken) {
                        dispatch(setTouchAction({...touchAction, options: {...options, tokensLeft: tokensLeft - 1}}))
                    }
                }
            } else {
                cardAction(action, activeCard?.id, touchAction.options, actionProps);
            }
            dispatch(setActiveCardObj(null));
        }
    }, [activeCardObj, touchAction, gameUi, playerN]);

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
    }, [activeCardObj, touchMode])


    return null;
})