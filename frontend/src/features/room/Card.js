import React, { useState, useEffect } from "react";
import { Tokens } from './Tokens';
import { useActiveCard, useSetActiveCard } from "../../contexts/ActiveCardContext";

//import cx from "classnames";

export const CARDSCALE = 4.5;

const handleDoubleClick = (event, card, setCard, broadcast, adjustVisible) => {
    if (adjustVisible) return;
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
    broadcast,
  }) => {
    const [card, setCard] = useState(inputCard);
    const [adjustVisible, setAdjustVisible] = useState(false);
    const activeCard = useActiveCard();
    const setActiveCard = useSetActiveCard();
    useEffect(() => {
        const onKeyDown = ({key}) => {
            if (key === "Shift") {
                setAdjustVisible(true);
            }
        }

        const onKeyUp = ({key}) => {
            if (key === "Shift") {
                setAdjustVisible(false);
            }
        }

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!card) return null;
    return (
        <div 
            key={card.id}
            style={{
                position: "absolute",
                background: `url(${card.src}) no-repeat`,
                backgroundSize: "contain",
                height: `${CARDSCALE/0.72}vw`,
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
                // WebkitBoxShadow: "10px 10px 29px 5px rgba(0,0,0,0.26)",
                // MozBoxShadow: "10px 10px 29px 5px rgba(0,0,0,0.26)",
                // boxShadow: "10px 10px 29px 5px rgba(0,0,0,0.26)",
            }}
            onDoubleClick={event => handleDoubleClick(event, card, setCard, broadcast, adjustVisible)}
            onClick={() => {if (activeCard !== card) {setActiveCard(card)}}}
        >
            <Tokens card={card} adjustVisible={adjustVisible && (activeCard===card)}></Tokens>
        </div>
    )
  }
  
  export default Card;