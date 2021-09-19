
import React from "react";
import { useSetActiveCard } from "../../contexts/ActiveCardContext";
import { useTouchMode } from "../../contexts/TouchModeContext";
import { getDisplayName } from "./Helpers";
import { useSetDropdownMenu } from "../../contexts/DropdownMenuContext";
import useLongPress from "../../hooks/useLongPress";
import { useTouchAction } from "../../contexts/TouchActionContext";


export const CardMouseRegion = React.memo(({
    position,
    top,
    card,
    isActive,
    setIsActive,
    zIndex,
    cardIndex,
    groupId,
    groupType,
    playerN,
}) => {
    const setActiveCardAndLoc = useSetActiveCard();
    const touchMode = useTouchMode();
    const touchAction = useTouchAction();
    const displayName = getDisplayName(card);
    const setDropdownMenu = useSetDropdownMenu();

    const makeActive = (event) => {
        const screenPosition = event.clientX > (window.innerWidth/2) ? "right" : "left";
        setActiveCardAndLoc({
            card: card,
            mousePosition: position, 
            screenPosition: screenPosition,
            clicked: true,
            setIsActive: setIsActive,
            groupId: groupId,
            groupType: groupType,
            cardIndex: cardIndex,
        });
    }

    const handleSetDropDownMenu = () => {
        const dropdownMenu = {
            type: "card",
            card: card,
            title: displayName,
            cardIndex: cardIndex,
            groupId: groupId,
            groupType: groupType,
            visible: true,
        }
        if (playerN) setDropdownMenu(dropdownMenu);
    }

    const handleClick = (event) => {
        event.stopPropagation();
        // Open the menu
        if (!touchMode) handleSetDropDownMenu();
        // Make the card active (since there was no mouseover)
        // The listener in HandleTouchButton will see the active card change and perform the touch action
        makeActive(event,position);
    }
    
    const handleMouseOver = (event) => {
        event.stopPropagation();
        makeActive(event,position);
        setIsActive(true);
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