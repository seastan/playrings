import React from "react";
import { useSelector } from 'react-redux';
import { Token } from "../plugins/lotrlcg/components/Token";
import { useGameDefinition } from "./functions/useGameDefinition";

export const Tokens = React.memo(({ 
    cardId,
    cardName,
    cardType,
    usesThreatToken,
    isActive,
    zIndex,
    aspectRatio,
 }) => {
    const spacePressed = useSelector(state => state?.playerUi?.keypress?.Space);
    const showButtons = isActive && spacePressed;
    const gameDef = useGameDefinition();
    const tokenTypes = gameDef.cardTypes?.[cardType]?.tokens || gameDef.cardTypes?._Other?.tokens || [];
    return(
        <div className="absolute" style={{width:'100%', height:'100%'}}>
            {tokenTypes.map((tokenType, _tokenIndex) => {
                return (
                    <Token 
                        tokenType={tokenType} 
                        cardId={cardId} 
                        cardName={cardName} 
                        zIndex={zIndex} 
                        aspectRatio={aspectRatio}  
                        showButtons={showButtons}/>
                )
            })}
{/*             <Token tokenType="resource"  cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"10%"} top={"0%"}  showButtons={showButtons}/>
            <Token tokenType="progress"  cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"10%"} top={"25%"} showButtons={showButtons}/>
            <Token tokenType="damage"    cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"10%"} top={"50%"} showButtons={showButtons}/>
            <Token tokenType="time"      cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"10%"} top={"75%"} showButtons={showButtons}/>
            <Token tokenType={usesThreatToken ? "threat" : "willpower"} cardId={cardId} aspectRatio={aspectRatio} cardName={cardName} zIndex={zIndex} left={"55%"} top={"0%"}  showButtons={showButtons}/>
            <Token tokenType="attack"    cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"55%"} top={"25%"} showButtons={showButtons}/>
            <Token tokenType="defense"   cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"55%"} top={"50%"} showButtons={showButtons}/>
            <Token tokenType="hitPoints" cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"55%"} top={"75%"} showButtons={showButtons}/>
 */}
         </div>
    )
});