import React, { useState } from "react";
import { useSelector } from 'react-redux';
import styled from "@emotion/styled";
import { Card } from "./Card";
import { Draggable } from "react-beautiful-dnd";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import store from "../../store";
import NaturalDragAnimation from 'natural-drag-animation-rbdnd';
import { useLayout } from "./hooks/useLayout";
import { ATTACHMENT_OFFSET } from "./functions/common";
import { useGameDefinition } from "./hooks/useGameDefinition";

export const StackContainer = styled.div`
  position: relative;
  userSelect: none;
  margin: 0vh ${props => props.margin}vh 0vh 0vh;
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
  hidden
}) => {
  const gameDef = useGameDefinition();
  const stack = useSelector(state => state?.gameUi?.game?.stackById[stackId]);
  const draggingToRegionType = useSelector(state => state?.playerUi?.dragging.toRegionType);
  const thisDrag = useSelector(state => state?.playerUi?.dragging?.stackId == stackId);
  const touchMode = useSelector(state => state?.playerUi?.touchMode);
  const zoomFactor = useSelector(state => state?.playerUi?.userSettings?.zoomPercent)/100;
  const layout = useLayout();
  const rowSpacing = layout?.rowSpacing;
  const cardSize = layout?.cardSize;
  const playerN = useSelector(state => state?.playerUi?.playerN);
  const [isMousedOver, setIsMousedOver] = useState(false);
  console.log('Rendering Stack ', {stackIndex, region, hidden, layout, zoomFactor});
  var spacingFactor = touchMode ? 1.5 : 1;
  const { height, width } = useWindowDimensions();
  const aspectRatio = width/height;
  if (!stack) return null;
  const cardIds = stack.cardIds;
  const numCards = cardIds.length;
  const card0 = store.getState().gameUi.game.cardById[cardIds[0]];
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
  // Calculate size of stack for proper spacing. Changes base on group type and number of stack in group.
  const numStacksNonZero = Math.max(numStacks, 1);
  const regionWidthInt = parseInt(region.width.substring(0, region.width.length - 1))
  const handSpacing = (regionWidthInt-cardSize)*aspectRatio/numStacksNonZero;
  const cardWidth = card0?.sides[card0?.currentSide]?.width;
  const cardHeight = card0?.sides[card0?.currentSide]?.height;
  const stackHeight = cardHeight*cardSize*zoomFactor;
  const stackWidth = cardWidth*cardSize + ATTACHMENT_OFFSET * (numCards - 1);
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
          {style => {
            const updatedStyle = {...style}
            if (dragSnapshot.isDropAnimating && draggingToRegionType === "free") updatedStyle.transitionDuration = "0.001s";
            if (Boolean(dragSnapshot.combineTargetFor)) updatedStyle.zIndex = 6000;
            if (updatedStyle.transform && dragSnapshot.isDragging) updatedStyle.transform = updatedStyle.transform + " scale(1.1)";
            updatedStyle.visibility = draggingToRegionType === "free" && ((thisDrag && style.transform === null) || dragSnapshot.isDropAnimating) ? "hidden" : "visible";
            return(
              <StackContainer
                isDragging={dragSnapshot.isDragging}
                isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
                stackWidth={region.type === "fan" ? stackWidthFan : stackWidth}
                stackHeight={stackHeight}
                margin={region.type === "row" ? rowSpacing : 0}
                ref={dragProvided.innerRef}
                {...dragProvided.draggableProps}
                {...dragProvided.dragHandleProps}
                onMouseEnter={() => setIsMousedOver(true)}
                onMouseLeave={() => setIsMousedOver(false)}
                style={updatedStyle}>
                {cardIds.map((cardId, cardIndex) => {
                  return(
                    <Card
                      key={cardId}
                      offset={offsets[cardIndex]}
                      cardId={cardId}
                      cardIndexFromGui={cardIndex}
                      isDragging={(cardIndex === cardIds.length - 1) ? dragSnapshot.isDragging : false}/>
                  )
              })}
              </StackContainer>)}}
        </NaturalDragAnimation>
      )}
    </Draggable>
  );
})
