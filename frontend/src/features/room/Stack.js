import React from "react";
import { useSelector } from 'react-redux';
import styled from "@emotion/styled";
import { Card } from "./Card";
import { Draggable } from "react-beautiful-dnd";
import { useTouchMode } from "../../contexts/TouchModeContext";
import { CARDSCALE } from "./Constants";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import store from "../../store";
import NaturalDragAnimation from 'natural-drag-animation-rbdnd';


const Container = styled.div`
  position: relative;
  userSelect: none;
  padding: 0;
  min-width: ${props => props.stackWidth}vh;
  width: ${props => props.stackWidth}vh;
  height: ${props => (props.groupType === "vertical") ? `${props.cardSize/3}vh` : "100%"};
  display: flex;
`;

export const Stack = React.memo(({
  gameBroadcast,
  chatBroadcast,
  groupId,
  groupType,
  stackIndex,
  stackId,
  numStacks,
  registerDivToArrowsContext
}) => {
  console.log('Rendering Stack ',stackIndex);
  const stack = useSelector(state => state?.gameUi?.game?.stackById[stackId]);
  const touchMode = useSelector(state => state?.playerUi?.touchMode);
  const cardSize = useSelector(state => state?.playerUi?.cardSize);
  const playerN = useSelector(state => state?.playerUi?.playerN);
  var spacingFactor = touchMode ? 1.5 : 1;
  if (groupId.includes("Extra")) spacingFactor = 0;
  const { height, width } = useWindowDimensions();
  const aspectRatio = width/height;
  if (!stack) return null;
  const cardIds = stack.cardIds;
  var leftOffsets = 0;
  var rightOffsets = 0;
  const offsets = [0];
  for (var i = 1; i<cardIds.length; i++) {
    const cardiId = cardIds[i];
    const cardi = store.getState().gameUi.game.cardById[cardiId];
    if (cardi.attachmentDirection && cardi.attachmentDirection === -1) {
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
  // Calculate size of stack for proper spacing. Changes base on group type and number of stack in group.
  const numStacksNonZero = numStacks > 0 ? numStacks : 1;
  var handSpacing = 45*aspectRatio/(numStacksNonZero);
  if (handSpacing > cardSize) handSpacing = cardSize;
  var stackWidth = groupType === "hand" ? handSpacing : cardSize/0.72 + cardSize*spacingFactor/3*(cardIds.length-1);
  console.log("StackCardSize ", cardSize)
  return (
    <Draggable 
      key={stackId} 
      draggableId={stackId} 
      index={stackIndex}
      isDragDisabled={playerN === null}
    >
      {(dragProvided, dragSnapshot) => (
        <NaturalDragAnimation
	      style={dragProvided.draggableProps.style}
	      snapshot={dragSnapshot}
        rotationMultiplier={1.3}
	    >
	      {style => (
        <Container
          isDragging={dragSnapshot.isDragging}
          isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
          stackWidth={stackWidth}
          groupType={groupType}
          cardSize={cardSize}
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          {...dragProvided.dragHandleProps}
          style={style}>
          {cardIds.map((cardId, cardIndex) => {
            return(
              <Card
                key={cardId}
                gameBroadcast={gameBroadcast} 
                chatBroadcast={chatBroadcast} 
                groupId={groupId}
                groupType={groupType}
                offset={offsets[cardIndex]}
                cardId={cardId} 
                cardIndex={cardIndex}
                registerDivToArrowsContext={registerDivToArrowsContext}
              />
            )
        })}
        </Container>)}</NaturalDragAnimation>
      )}
    </Draggable>
  );
})
