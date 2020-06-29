import React, { useState, useEffect } from "react";
import { Tokens } from './Tokens';
import { useActiveCard, useSetActiveCard } from "../../contexts/ActiveCardContext";

//import cx from "classnames";

export const CARDSCALE = 4.5;



export const CardView = ({
    inputCard,
    cardIndex,
    broadcast,
  }) => {
    const [card, setCard] = useState(inputCard);
    const [shiftDown, setShiftDown] = useState(false);
    const activeCard = useActiveCard();
    const setActiveCard = useSetActiveCard();

    const handleSetActiveCard = (event) => {
        if (activeCard !== card) {
            setActiveCard(card);
        }
    }

    const handleDoubleClick = (event) => {
        if (shiftDown) return;
        if (!card.exhausted) {
            card.exhausted = true;
            card.rotation = 90;
        } else {
            card.exhausted = false;
            card.rotation = 0;
        }
        setCard({...card});
        //setTimeout(setActiveCard(card),2000);
    }

    useEffect(() => {

        const onKeyDown = ({key}) => {
            if (key === "Shift") {
                setShiftDown(true);
            }
        }

        const onKeyUp = ({key}) => {
            if (key === "Shift") {
                setShiftDown(false);
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
    console.log('rendering card');
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
                borderWidth: '2px',
                borderRadius: '5px',
                borderColor: (activeCard === card) ? 'yellow' : 'transparent',
                //transform: `rotate(${angles}deg)`,
                transform: `rotate(${card.rotation}deg)`,
                zIndex: 1e5-cardIndex,
                WebkitTransitionDuration: "0.1s",
                MozTransitionDuration: "0.1s",
                OTransitionDuration: "0.1s",
                transitionDuration: "0.1s",
                WebkitTransitionProperty: "-webkit-transform",
                MozTransitionProperty: "-moz-transform",
                OTransitionProperty: "-o-transform",
                transitionProperty: "transform",
                // WebkitBoxShadow: "10px 10px 29px 5px rgba(0,0,0,0.26)",
                // MozBoxShadow: "10px 10px 29px 5px rgba(0,0,0,0.26)",
                // boxShadow: "10px 10px 29px 5px rgba(0,0,0,0.26)",
            }}
            onDoubleClick={event => handleDoubleClick(event)}
            onMouseEnter={event => handleSetActiveCard(event)}
        >
            <Tokens card={card} adjustVisible={shiftDown && (activeCard===card)}></Tokens>
        </div>
    )
  }
  
  export default CardView;