
import React from "react";
import { getDisplayName } from "../plugins/lotrlcg/functions/helpers";
import useLongPress from "../../hooks/useLongPress";
import { useDispatch, useSelector } from "react-redux";
import { setActiveCardId, setActiveCardObj, setDropdownMenuObj } from "../store/playerUiSlice";


export const CardMouseRegion = React.memo(({
    position,
    top,
    cardId,
    isActive,
    //setIsActive,
    zIndex,
    cardIndex,
    groupId,
    groupType,
}) => {
    const dispatch = useDispatch();
    const card = useSelector(state => state?.gameUi?.game?.cardById[cardId]);
    const displayName = getDisplayName(card);    
    const playerN = useSelector(state => state?.playerUi?.playerN)
    const touchMode = useSelector(state => state?.playerUi?.touchMode)
    const touchAction = useSelector(state => state?.playerUi?.touchAction)

    const makeActive = (event) => {
        const screenPosition = event.clientX > (window.innerWidth/2) ? "right" : "left";
        dispatch(setActiveCardId(card.id))
        dispatch(setActiveCardObj({
            card: {
                ...card,
                groupId: groupId,
                groupType: groupType,
                cardIndex: cardIndex,
            },
            mousePosition: position, 
            screenPosition: screenPosition,
            clicked: true,
            //setIsActive: setIsActive,
            groupId: groupId,
            groupType: groupType,
            cardIndex: cardIndex,
        }));
    }

    const handleSetDropDownMenu = () => {
        const dropdownMenuObj = {
            type: "card",
            cardId: card.id,
            title: displayName,
            visible: true,
        }
        if (playerN) dispatch(setDropdownMenuObj(dropdownMenuObj));
    }

    const handleClick = (event) => {
        console.log("cardclick", card);
        event.stopPropagation();
        // Open the menu
        if (!touchMode) handleSetDropDownMenu();
        // Make the card active (since there was no mouseover)
        // The listener in HandleTouchButton will see the active card change and perform the touch action
        // if (event.touches && event.touches[0].touchType === "stylus") return; // Apple pencil fix attempt (didn't work)
        makeActive(event,position);
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