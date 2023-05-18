import { useSelector } from 'react-redux';
import { useCardScaleFactor } from './useCardScaleFactor';
import { ATTACHMENT_OFFSET } from '../functions/common';
import { useCardProp } from './useCardProp';
import { useCardZIndex } from './useCardZIndex';
import { useGameDefinition } from './useGameDefinition';
import { useVisibleFace } from './useVisibleFace';

export const useCardStyle = (cardId, isDragging) => {
    const gameDef = useGameDefinition();
    const cardRotation = useCardProp(cardId, "rotation");
    const cardIndex = useCardProp(cardId, "cardIndex");
    const cardScaleFactor = useCardScaleFactor();
    const cardVisibleFace = useVisibleFace(cardId);
    const zIndex = useCardZIndex(cardId);
    const isActive = useSelector(state => {return state?.playerUi?.activeCardId === cardId});
    const cardBorderColor = useSelector(state => state?.gameUi?.game?.cardById[cardId]?.borderColor);

    var [height, width] = [cardVisibleFace.height, cardVisibleFace.width];
    if (!height || !width) {
        height = gameDef?.cardBacks?.[cardVisibleFace.name]?.height;
        width = gameDef?.cardBacks?.[cardVisibleFace.name]?.width;
    }

    const style = {
        position: "absolute",
        height: `${cardScaleFactor*height}vh`,
        width: `${cardScaleFactor*width}vh`,
        left: `${ATTACHMENT_OFFSET*cardIndex}vh`,
        top: "50%",
        borderRadius: '0.6vh',
        transform: `translate(0%, -50%) rotate(${cardRotation}deg)`,
        zIndex: zIndex,
        cursor: "default",
        WebkitTransitionDuration: "0.1s",
        MozTransitionDuration: "0.1s",
        OTransitionDuration: "0.1s",
        transitionDuration: "0.1s",
        WebkitTransitionProperty: "-webkit-transform",
        MozTransitionProperty: "-moz-transform",
        OTransitionProperty: "-o-transform",
        transitionProperty: "transform",
        MozBoxShadow: isDragging ? '10px 10px 30px 20px rgba(0, 0, 0, 0.3)' : null,
        WebkitBoxShadow: isDragging ? '10px 10px 30px 20px rgba(0, 0, 0, 0.3)': null,
        boxShadow: isDragging ? '10px 10px 30px 20px rgba(0, 0, 0, 0.3)': null,  
        '--tw-shadow': cardBorderColor ? '0 0 10px red' : null,
        boxShadow: cardBorderColor ? 'var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)' : null,
      
    }
    return style;
}