import React from "react";
import { useSelector } from 'react-redux';
import styled from "@emotion/styled";
import { Card } from "./Card";
import { Draggable } from "react-beautiful-dnd";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import store from "../../store";
import NaturalDragAnimation from 'natural-drag-animation-rbdnd';
import { useCardScaleFactor } from "../../hooks/useCardScaleFactor";


const Container = styled.div`
  position: relative;
  userSelect: none;
  padding: 0;
  min-width: ${props => props.stackWidth}vh;
  width: ${props => props.stackWidth}vh;
  height: ${props => (props.groupType === "vertical") ? `${props.cardSize/3}vh` : "100%"};
  display: ${props => (props.hidden) ? "none" : "flex"};
`;

export const Stack = React.memo(({
  groupId,
  groupType,
  stackIndex,
  stackId,
  numStacks,
  registerDivToArrowsContext,
  hidden,
}) => {
  console.log('Rendering Stack ',stackIndex);
  const stack = useSelector(state => state?.gameUi?.game?.stackById[stackId]);
  const touchMode = useSelector(state => state?.playerUi?.touchMode);
  const cardScaleFactor = useCardScaleFactor();
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
  if (handSpacing > cardScaleFactor) handSpacing = cardScaleFactor;
  var stackWidth = groupType === "horizontalFan" ? handSpacing : cardScaleFactor/0.72 + cardScaleFactor*spacingFactor/3*(cardIds.length-1);
  return (
    <Draggable 
      key={stackId} 
      draggableId={stackId} 
      index={stackIndex}
      isDragDisabled={playerN === null}>
      {(dragProvided, dragSnapshot) => (
        <NaturalDragAnimation
          style={dragProvided.draggableProps.style}
          snapshot={dragSnapshot}
          rotationMultiplier={1}>
          {style => (
          <Container
            isDragging={dragSnapshot.isDragging}
            isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
            stackWidth={stackWidth}
            groupType={groupType}
            cardSize={cardScaleFactor}
            hidden={hidden}
            ref={dragProvided.innerRef}
            {...dragProvided.draggableProps}
            {...dragProvided.dragHandleProps}
            style={{...style,
              transform: style.transform ? (dragSnapshot.isDragging ? style.transform + " scale(1.1)" : style.transform) : null,
              zIndex: Boolean(dragSnapshot.combineTargetFor) ? 6000 : style.zIndex,
              //Boolean(dragSnapshot.combineTargetFor) ? {...style, zIndex:6000} : style
              //</NaturalDragAnimation>dragSnapshot.isDragging ? {...style, transform: style.transform ? style.transform + " scale(1.1)" : "scale(1.1)"} : style
            }}>
            {cardIds.map((cardId, cardIndex) => {
              return(
                <Card
                  key={cardId}
                  groupId={groupId}
                  groupType={groupType}
                  offset={offsets[cardIndex]}
                  cardId={cardId} 
                  cardIndex={cardIndex}
                  registerDivToArrowsContext={registerDivToArrowsContext}
                  isDragging={(cardIndex === cardIds.length - 1) ? dragSnapshot.isDragging : false}
                />
              )
          })}
          </Container>)}
        </NaturalDragAnimation>
      )}
    </Draggable>
  );
})
