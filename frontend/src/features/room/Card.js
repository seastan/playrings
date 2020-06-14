import React, { useState, useEffect } from "react";
//import cx from "classnames";

export const CARDSCALE = 4.5;

const handleDoubleClick = (event, card, setCard, broadcast) => {
    if (!card.exhausted) {
        card.exhausted = true;
        card.rotation = 90;
    } else {
        card.exhausted = false;
        card.rotation = 0;
    }
    setCard({...card});
}

export const Card = ({
    inputCard,
    cardIndex,
    broadcast
  }) => {
    const [card, setCard] = useState(inputCard);
    if (!card) return null;
    return (
        <div 
            key={card.id}
            style={{
                position: "absolute",
                background: `url(${card.src}) no-repeat`,
                backgroundSize: "contain",
                height: `${CARDSCALE/0.7}vw`,
                width: `${CARDSCALE}vw`,
                left: `${CARDSCALE/3*cardIndex}vw`,
                //transform: `rotate(${angles}deg)`,
                transform: `rotate(${card.rotation}deg)`,
                zIndex: 1e5-cardIndex,
                WebkitTransitionDuration: "0.2s",
                MozTransitionDuration: "0.2s",
                OTransitionDuration: "0.2s",
                transitionDuration: "0.2s",
                WebkitTransitionProperty: "-webkit-transform",
                MozTransitionProperty: "-moz-transform",
                OTransitionProperty: "-o-transform",
                transitionProperty: "transform",
            }}
            //onDoubleClick={() => broadcast("toggle_exhaust",{group, stack, card})}
            //onDoubleClick={() => toggleExhaust(inputGroup, setGroup, stackIndex, cardIndex, broadcast)}
            onDoubleClick={event => handleDoubleClick(event, card, setCard, broadcast)}
        >
        </div>
    )
  }
  
  export default Card;