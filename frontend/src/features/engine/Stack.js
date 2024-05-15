import React from "react";
import { useSelector } from 'react-redux';
import { Card } from "./Card";
import store from "../../store";
import { useGameDefinition } from "./hooks/useGameDefinition";

//left: ${props => props.left || 0}vh;
// background: ${props => (props.hidden) ? "red" : "blue"};
  // display: ${props => (props.hidden) ? "none" : "flex"};

export const Stack = React.memo(({
  stackId,
  isDragging,
}) => {
  const gameDef = useGameDefinition();
  const stack = useSelector(state => state?.gameUi?.game?.stackById[stackId]);
  if (!stack) return null;
  const cardIds = stack?.cardIds;

  var leftOffsets = 0;
  var rightOffsets = 0;
  const offsets = [0];
  for (var i = 1; i<cardIds.length; i++) {
    const cardiId = cardIds[i];
    const cardi = store.getState().gameUi.game.cardById[cardiId];
    if (cardi.attachmentDirection === -1) {
      leftOffsets++;
      offsets.push(-leftOffsets);
    } else if (cardi.attachmentDirection === 1) {
      rightOffsets++;
      offsets.push(rightOffsets);
    } else if (gameDef?.defaultAttachmentDirection === "left") {
      leftOffsets++;
      offsets.push(-leftOffsets);
    } else {
      rightOffsets++;
      offsets.push(rightOffsets);
    }
  }
  for (var i = 0; i< offsets.length; i++) {
    offsets[i] += leftOffsets;
  }
  return(
    cardIds.map((cardId, cardIndex) => {
      return(
        <Card
          key={cardId}
          offset={offsets[cardIndex]}
          cardId={cardId}
          cardIndexFromGui={cardIndex}
          isDragging={(cardIndex === cardIds.length - 1) ? isDragging : false}
        />
      )
    })
  );
});

