import React from "react";
import { useSelector } from 'react-redux';
import { Token } from "./Token";
import { useGameDefinition } from "./functions/useGameDefinition";

export const Tokens = React.memo(({ 
    cardId,
    cardName,
    cardType,
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
         </div>
    )
});