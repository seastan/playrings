import React from "react";
import { useSelector } from 'react-redux';
import { Token } from "./Token";
import { useGameDefinition } from "./hooks/useGameDefinition";
import { useCardZIndex } from "./hooks/useCardZIndex";

export const Tokens = React.memo(({ 
    cardId,
    isActive,
    aspectRatio,
 }) => {
    const spacePressed = useSelector(state => state?.playerUi?.keypress?.Space);
    const showButtons = isActive && spacePressed;
    const gameDef = useGameDefinition();
    const sideAType = useSelector(state => state?.gameUi?.game?.cardById?.[cardId]?.sides?.A?.type);
    const tokenTypes = gameDef.cardTypes?.[sideAType]?.tokens || [];
    const zIndex = useCardZIndex(cardId);
    console.log("Rendering Tokens",cardId,showButtons)
    return(
        <div className="absolute" style={{width:'100%', height:'100%'}}>
            {tokenTypes.map((tokenType, tokenIndex) => {
                return (
                    <Token 
                        key={tokenIndex}
                        tokenType={tokenType} 
                        cardId={cardId}
                        zIndex={zIndex} 
                        aspectRatio={aspectRatio}  
                        showButtons={showButtons}/>
                )
            })}
         </div>
    )
});