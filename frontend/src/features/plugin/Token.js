import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { tokenPrintName } from "./Helpers";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

var delayBroadcast;

export const Token = React.memo(({
    cardId,
    cardName,
    tokenType,
    left,
    top,
    showButtons,
    gameBroadcast,
    chatBroadcast,
    zIndex,
    aspectRatio,
}) => {
    const tokenStore = state => state?.gameUi?.game?.cardById?.[cardId]?.tokens?.[tokenType];
    const tokenValue = useSelector(tokenStore);
    const committedStore = state => state?.gameUi?.game?.cardById?.[cardId]?.committed;
    const committed = useSelector(committedStore);
    const [buttonLeftVisible, setButtonLeftVisible] = useState(false);
    const [buttonRightVisible, setButtonRightVisible] = useState(false);
    const [amount, setAmount] = useState(tokenValue);
    const printName = tokenPrintName(tokenType);

    useEffect(() => {    
        if (tokenValue !== amount) setAmount(tokenValue);
    }, [tokenValue]);

    if (tokenValue === null) return null;

    function clickArrow(event,delta) {
        event.stopPropagation();
        var newAmount = 0;
        if ((tokenType==="resource" || tokenType==="progress" || tokenType==="damage" || tokenType==="time") && (amount+delta < 0)) {
            newAmount = 0;
        } else {
            newAmount = amount+delta;
        }
        setAmount(newAmount);
        // Determine total number of tokens added or removed since last broadcast
        const totalDelta = newAmount-tokenValue;
        // Set up a delayed broadcast to update the game state that interupts itself if the button is clicked again shortly after.
        if (delayBroadcast) clearTimeout(delayBroadcast);
        delayBroadcast = setTimeout(function() {
            gameBroadcast("game_action", {action:"update_values", options: {updates: [["game", "cardById", cardId, "tokens", tokenType, newAmount]]}});
            if (committed && tokenType === "willpower") gameBroadcast("game_action", {action:"increment_willpower", options: {increment: totalDelta}});
            if (totalDelta > 0) {
                if (totalDelta === 1) {
                    chatBroadcast("game_update",{message: "added "+totalDelta+" "+printName+" token to "+cardName+"."});
                } else {
                    chatBroadcast("game_update",{message: "added "+totalDelta+" "+printName+" tokens to "+cardName+"."});
                }
            } else if (totalDelta < 0) {
                if (totalDelta === -1) {
                    chatBroadcast("game_update",{message: "removed "+(-totalDelta)+" "+printName+" token from "+cardName+"."});
                } else {
                    chatBroadcast("game_update",{message: "removed "+(-totalDelta)+" "+printName+" tokens from "+cardName+"."});
                }                
            }
        }, 500);
    }
    // Prevent doubleclick from interfering with 2 clicks
    function handleDoubleClick(event) {
        event.stopPropagation();
    }

    return(
        <div
            style={{
                position: "absolute",
                left: left,
                top: top,
                height: `${22*(1-0.6*(0.7-aspectRatio))}%`,
                zIndex: showButtons ? zIndex + 1 : "",
                display: showButtons || amount!==0 ? "block" : "none"}}>
            <div
                className="flex absolute text-white text-center w-full h-full items-center justify-center"
                style={{
                    textShadow: "rgb(0, 0, 0) 2px 0px 0px, rgb(0, 0, 0) 1.75517px 0.958851px 0px, rgb(0, 0, 0) 1.0806px 1.68294px 0px, rgb(0, 0, 0) 0.141474px 1.99499px 0px, rgb(0, 0, 0) -0.832294px 1.81859px 0px, rgb(0, 0, 0) -1.60229px 1.19694px 0px, rgb(0, 0, 0) -1.97999px 0.28224px 0px, rgb(0, 0, 0) -1.87291px -0.701566px 0px, rgb(0, 0, 0) -1.30729px -1.51361px 0px, rgb(0, 0, 0) -0.421592px -1.95506px 0px, rgb(0, 0, 0) 0.567324px -1.91785px 0px, rgb(0, 0, 0) 1.41734px -1.41108px 0px, rgb(0, 0, 0) 1.92034px -0.558831px 0px",
                }}>
                {(tokenType==="threat" || tokenType==="willpower" || tokenType==="attack" || tokenType==="defense" || tokenType==="hitPoints") && amount>0 ? "+"+amount : amount}
            </div>

            <div
                className="text-center"
                style={{
                    position: "absolute",
                    height: "50%",
                    width: "100%",
                    top: "50%",
                    backgroundColor: "black",
                    opacity: buttonLeftVisible ? "65%" : "0%",
                    display: showButtons ? "block" : "none",
                    zIndex: zIndex + 2,
                }}
                onMouseOver={() => setButtonLeftVisible(true)}
                onMouseLeave={() => setButtonLeftVisible(false)}
                onClick={(event) => clickArrow(event,-1)}
                onDoubleClick={(event) => handleDoubleClick(event)}>
                <FontAwesomeIcon 
                    className="text-white" 
                    style={{
                        position:"absolute", 
                        top:"15%", 
                        left:"30%",
                    }}  
                    icon={faChevronDown}/>
            </div>

            <div
                className="text-center"
                style={{
                    position: "absolute",
                    height: "50%",
                    width: "100%",
                    backgroundColor: "black",
                    opacity: buttonRightVisible ? "65%" : "0%",
                    display: showButtons ? "block" : "none",
                    zIndex: zIndex + 2,
                }}
                onMouseOver={() => setButtonRightVisible(true)}
                onMouseLeave={() => setButtonRightVisible(false)}
                onClick={(event) => clickArrow(event,1)}
                onDoubleClick={(event) => handleDoubleClick(event)}>
                <FontAwesomeIcon 
                    className="text-white" 
                    style={{
                        position:"absolute", 
                        top:"15%", 
                        left:"30%",
                    }} 
                    icon={faChevronUp}
                />
            </div>
            <img 
                className="block h-full"
                src={process.env.PUBLIC_URL + '/images/tokens/'+tokenType+'.png'}/>
        </div>
    )
})