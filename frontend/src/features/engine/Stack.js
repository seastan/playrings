import React, { useState } from "react";
import { useSelector } from 'react-redux';
import styled from "@emotion/styled";
import { Card } from "./Card";
import { Draggable } from "react-beautiful-dnd";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import store from "../../store";
import NaturalDragAnimation from 'natural-drag-animation-rbdnd';
import { useLayout } from "./functions/useLayout";

export const StackContainer = styled.div`
  position: relative;
  userSelect: none;
  padding: 0;
  width: ${props => props.stackWidth}vh;
  height: ${props => props.stackHeight}vh;
`;
//left: ${props => props.left || 0}vh;
// background: ${props => (props.hidden) ? "red" : "blue"};
  // display: ${props => (props.hidden) ? "none" : "flex"};

export const Stack = React.memo(({
  groupId,
  region,
  stackIndex,
  stackId,
  numStacks,
  registerDivToArrowsContext,
  hidden,
}) => {
  console.log('Rendering Stack ',stackIndex, region, hidden);
  const stack = useSelector(state => state?.gameUi?.game?.stackById[stackId]);
  const touchMode = useSelector(state => state?.playerUi?.touchMode);
  const zoomFactor = useSelector(state => state?.playerUi?.zoomFactor);
  const layout = useLayout();
  const rowSpacing = layout?.rowSpacing;
  const cardSize = layout?.cardSize;
  const playerN = useSelector(state => state?.playerUi?.playerN);
  const [isMousedOver, setIsMousedOver] = useState(false);
  var spacingFactor = touchMode ? 1.5 : 1;
  if (groupId.includes("Extra")) spacingFactor = 0;
  const { height, width } = useWindowDimensions();
  const aspectRatio = width/height;
  if (!stack) return null;
  const cardIds = stack.cardIds;
  const card0 = store.getState().gameUi.game.cardById[cardIds[0]];
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
  const numStacksNonZero = Math.max(numStacks, 1);
  const regionWidthInt = parseInt(region.width.substring(0, region.width.length - 1))
  const handSpacing = (regionWidthInt-cardSize)*aspectRatio/numStacksNonZero;
  const cardWidth = card0?.sides[card0?.currentSide]?.width;
  const cardHeight = card0?.sides[card0?.currentSide]?.height;
  const stackHeight = cardHeight*cardSize*zoomFactor;
  const stackWidth = cardWidth*cardSize*zoomFactor;
  const stackWidthFan = Math.min(handSpacing, cardWidth*cardSize*zoomFactor);
  
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
          <StackContainer
            isDragging={dragSnapshot.isDragging}
            isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
            stackWidth={region.type === "fan" ? stackWidthFan : stackWidth}
            stackHeight={stackHeight}
            left={stackIndex*rowSpacing}
            hidden={hidden}
            ref={dragProvided.innerRef}
            {...dragProvided.draggableProps}
            {...dragProvided.dragHandleProps}
            onMouseEnter={() => setIsMousedOver(true)}
            onMouseLeave={() => setIsMousedOver(false)}
            style={{...style,
              //transition: style.transition ? (dragSnapshot.isDragging ? style.transition + " scale 0.s ease-out" : style.transition) : null,
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
                  region={region}
                  offset={offsets[cardIndex]}
                  cardId={cardId} 
                  cardIndex={cardIndex}
                  registerDivToArrowsContext={registerDivToArrowsContext}
                  isDragging={(cardIndex === cardIds.length - 1) ? dragSnapshot.isDragging : false}
                />
              )
          })}
          </StackContainer>)}
        </NaturalDragAnimation>
      )}
    </Draggable>
  );
})
