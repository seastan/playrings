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
    side,
 }) => {
    const spacePressed = useSelector(state => state?.playerUi?.keypress?.Space);
    const showButtons = isActive && spacePressed;
    return(
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