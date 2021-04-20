
import React from "react";
import { useActiveCard, useSetActiveCard } from "../../contexts/ActiveCardContext";

export const CardMouseRegion = React.memo(({
    position,
    top,
    card,
    setIsActive,
    zIndex,
}) => {
    //const activeCard = useActiveCard();
    const setActiveCard = useSetActiveCard();

    const handleMouseOver = (event, mousePosition) => {
        //return;
        const screenPosition = event.clientX > (window.innerWidth/2) ? "right" : "left";
        setActiveCard({
            card: card,
            mousePosition: mousePosition, 
            screenPosition: screenPosition,
        });
        setIsActive(true);
    }


    return(
        <div style={{
            position: 'absolute',
            top: top,
            width: '100%',
            height: '50%',
            zIndex: zIndex,
        }}
            onMouseOver={event => handleMouseOver(event,position)}
        ></div>
    )
})