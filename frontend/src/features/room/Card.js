import React, { useState, useEffect } from "react";
import { Tokens } from './Tokens';
import { useActiveCard, useSetActiveCard } from "../../contexts/ActiveCardContext";

//import cx from "classnames";

export const CARDSCALE = 4.5;
const threatURL    = "https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/Sets/Markers%20and%20Tokens/Markers/39df75f2-141d-425f-b651-d572b4885004.png";
const willpowerURL = "https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/Sets/Markers%20and%20Tokens/Markers/f24eb0c4-8405-4599-ba80-95bc009ae9fb.png";
const attackURL    = "https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/Sets/Markers%20and%20Tokens/Markers/53f20b83-6292-4017-abd0-511efdaf710d.png";
const defenseURL   = "https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/Sets/Markers%20and%20Tokens/Markers/6987d1a6-55ab-4ced-bbec-4e5b3490a40e.png";
const resourceURL  = "https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/Sets/Markers%20and%20Tokens/Markers/62a2ba76-9872-481b-b8fc-ec35447ca640.png";
const damageURL    = "https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/Sets/Markers%20and%20Tokens/Markers/38d55f36-04d7-4cf9-a496-06cb84de567d.png";
const progressURL  = "https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/Sets/Markers%20and%20Tokens/Markers/e9a419ff-5154-41cf-b84f-95149cc19a2a.png";
const timeURL      = "https://raw.githubusercontent.com/seastan/Lord-of-the-Rings/master/o8g/Sets/Markers%20and%20Tokens/Markers/31627422-f546-4a69-86df-ca0a028f3138.png";


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