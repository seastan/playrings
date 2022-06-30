import React from "react";
import { useSelector } from 'react-redux';
import { Token } from "../plugins/lotrlcg/components/Token";

export const Tokens = React.memo(({ 
    cardId,
    cardName,
    usesThreatToken,
    isActive,
    zIndex,
    aspectRatio,
 }) => {
    const spacePressed = useSelector(state => state?.playerUi?.keypress?.Space);
    const showButtons = isActive && spacePressed;
    var blackRiderX = false;
    for (var i=1; i<10; i++) {if (cardName === "Black Rider "+i) blackRiderX = true} 
    if (blackRiderX) return (
        <div className="absolute" style={{width:'100%', height:'100%'}}>
            <Token tokenType="resource"  cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"10%"} top={"50%"} showButtons={showButtons}/>
            <Token tokenType="progress1"  cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"10%"} top={"0%"} showButtons={showButtons}/>
            <Token tokenType="progress2"  cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"40%"} top={"0%"} showButtons={showButtons}/>
            <Token tokenType="progress3"  cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"70%"} top={"0%"} showButtons={showButtons}/>
            <Token tokenType="progress4"  cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"10%"} top={"20%"} showButtons={showButtons}/>
            <Token tokenType="progress5"  cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"40%"} top={"20%"} showButtons={showButtons}/>
            <Token tokenType="progress6"  cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"70%"} top={"20%"} showButtons={showButtons}/>
            <Token tokenType="progress7"  cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"40%"} top={"40%"} showButtons={showButtons}/>
            <Token tokenType="progress8"  cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"70%"} top={"40%"} showButtons={showButtons}/>
            <Token tokenType="progress9"  cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"40%"} top={"60%"} showButtons={showButtons}/>
            <Token tokenType="progress10" cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"70%"} top={"60%"} showButtons={showButtons}/>
        </div>
    ) 
    else return(
        <div className="absolute" style={{width:'100%', height:'100%'}}>
            <Token tokenType="resource"  cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"10%"} top={"0%"}  showButtons={showButtons}/>
            <Token tokenType="progress"  cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"10%"} top={"25%"} showButtons={showButtons}/>
            <Token tokenType="damage"    cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"10%"} top={"50%"} showButtons={showButtons}/>
            <Token tokenType="time"      cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"10%"} top={"75%"} showButtons={showButtons}/>
            <Token tokenType={usesThreatToken ? "threat" : "willpower"} cardId={cardId} aspectRatio={aspectRatio} cardName={cardName} zIndex={zIndex} left={"55%"} top={"0%"}  showButtons={showButtons}/>
            <Token tokenType="attack"    cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"55%"} top={"25%"} showButtons={showButtons}/>
            <Token tokenType="defense"   cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"55%"} top={"50%"} showButtons={showButtons}/>
            <Token tokenType="hitPoints" cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"55%"} top={"75%"} showButtons={showButtons}/>
        </div>
    )
});