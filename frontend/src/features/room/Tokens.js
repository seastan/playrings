import React from "react";
import { useSelector } from 'react-redux';
import { Token } from "./Token";
import { usesThreatToken } from "./Helpers";
import { useKeypress } from "../../contexts/KeypressContext";

export const Tokens = React.memo(({ 
    cardId,
    cardName,
    isActive,
    gameBroadcast,
    chatBroadcast,
    zIndex,
    aspectRatio,
 }) => {
    const cardStore = state => state?.gameUi?.game?.cardById?.[cardId];
    const card = useSelector(cardStore);
    const keypress = useKeypress();
    const showButtons = isActive && keypress["Space"];
    return(
        <div className="absolute" style={{width:'100%', height:'100%'}}>
            <Token tokenType="resource"  cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"10%"} top={"0%"}  showButtons={showButtons} gameBroadcast={gameBroadcast} chatBroadcast={chatBroadcast}/>
            <Token tokenType="progress"  cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"10%"} top={"25%"} showButtons={showButtons} gameBroadcast={gameBroadcast} chatBroadcast={chatBroadcast}/>
            <Token tokenType="damage"    cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"10%"} top={"50%"} showButtons={showButtons} gameBroadcast={gameBroadcast} chatBroadcast={chatBroadcast}/>
            <Token tokenType="time"      cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"10%"} top={"75%"} showButtons={showButtons} gameBroadcast={gameBroadcast} chatBroadcast={chatBroadcast}/>
            <Token tokenType={usesThreatToken(card) ? "threat" : "willpower"} cardId={cardId} aspectRatio={aspectRatio} cardName={cardName} zIndex={zIndex} left={"55%"} top={"0%"}  showButtons={showButtons} gameBroadcast={gameBroadcast} chatBroadcast={chatBroadcast}/>
            <Token tokenType="attack"    cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"55%"} top={"25%"} showButtons={showButtons} gameBroadcast={gameBroadcast} chatBroadcast={chatBroadcast}/>
            <Token tokenType="defense"   cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"55%"} top={"50%"} showButtons={showButtons} gameBroadcast={gameBroadcast} chatBroadcast={chatBroadcast}/>
            <Token tokenType="hitPoints" cardId={cardId} cardName={cardName} zIndex={zIndex} aspectRatio={aspectRatio} left={"55%"} top={"75%"} showButtons={showButtons} gameBroadcast={gameBroadcast} chatBroadcast={chatBroadcast}/>
        </div>
    )
});