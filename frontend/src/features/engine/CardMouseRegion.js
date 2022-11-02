
import React, { useEffect, useState } from "react";
import { getDisplayName, getVisibleFace } from "../plugins/lotrlcg/functions/helpers";
import useLongPress from "../../hooks/useLongPress";
import { useDispatch, useSelector } from "react-redux";
import { setActiveCardId, setActiveCardObj, setDropdownMenuObj } from "../store/playerUiSlice";
import { useHandleTouchAction } from "./functions/useHandleTouchAction";


export const CardMouseRegion = React.memo(({
    position,
    top,
    cardId,
    isActive,
    zIndex,
}) => {
    const dispatch = useDispatch();
    const card = useSelector(state => state?.gameUi?.game?.cardById[cardId]);
    const playerN = useSelector(state => state?.playerUi?.playerN);
    const touchMode = useSelector(state => state?.playerUi?.touchMode);
    const touchAction = useSelector(state => state?.playerUi?.touchAction);
    const handleTouchAction = useHandleTouchAction();

    const makeActive = (event) => {
        const screenPosition = event.clientX > (window.innerWidth/2) ? "right" : "left";
        dispatch(setActiveCardId(card.id))
        dispatch(setActiveCardObj({
            card: card,
            mousePosition: position, 
            screenPosition: screenPosition,
            clicked: true
        }));
    }

    const handleSetDropDownMenu = () => {
        const dropdownMenuObj = {
            type: "card",
            cardId: card.id,
            title: getVisibleFace(card, playerN)?.name,
            visible: true,
        }
        if (playerN) dispatch(setDropdownMenuObj(dropdownMenuObj));
    }

    const handleClick = (event) => {
        console.log("cardclick", card);
        event.stopPropagation();        
        makeActive(event,position);
        // What to do depends on whether touch mode is active
        if (touchMode) handleTouchAction(card);
        else handleSetDropDownMenu();
    }
    
    const handleMouseOver = (event) => {
        event.stopPropagation();
        makeActive(event,position);
        //setIsActive(true);
    }

    const onLongPress = (event) => {
        event.preventDefault();
        handleSetDropDownMenu();
    };

    const defaultOptions = {
        shouldPreventDefault: true,
        delay: 800,
    };

    const longPress = useLongPress(onLongPress, handleClick, defaultOptions);
    const regionStyle = {
        position: 'absolute',
        top: top,
        width: '100%',
        height: '50%',
        zIndex: zIndex,
    }

    if (touchMode) {
        return(
            <div 
                {...longPress}
                style={regionStyle}
                onMouseOver={event => !isActive && !touchAction && makeActive(event)}
            />
    )} else return (
            <div 
                style={regionStyle}
                onMouseOver={event =>  handleMouseOver(event)}
                onClick={event => handleClick(event)}
            />  
    )
})