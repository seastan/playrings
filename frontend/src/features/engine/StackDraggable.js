import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Draggable } from "react-beautiful-dnd";
import { useLayout } from "./hooks/useLayout";
import { useGameDefinition } from "./hooks/useGameDefinition";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import store from "../../store";
import { ATTACHMENT_OFFSET, convertToPercentage } from "./functions/common";
import NaturalDragAnimation from 'natural-drag-animation-rbdnd';
import { Card } from "./Card";
import styled from "@emotion/styled";
import { setTempDragStack } from "../store/playerUiSlice";
import { Stack } from "./Stack";

const StackContainerFree = styled.div`
  position: absolute;
  float: left;
  userSelect: none;
  margin: 0vh ${props => props.margin}vh 0vh 0vh;
  left: ${props => props.stackLeft}%;
  top: ${props => props.stackTop}%;
  width: ${props => props.stackWidth}vh;
  height: ${props => props.stackHeight}vh;
`;

export const StackContainerSorted = styled.div`
  position: relative;
  userSelect: none;
  width: ${props => props.stackWidth}vh;
  height: ${props => props.stackHeight}vh;
  margin: 0vh ${props => props.margin}vh 0vh 0vh;
`;
//
//
export const StackDraggable = React.memo(({
    region,
    stackIndex,
    stackId,
    numStacksVisible,
    onDragEnd
  }) => {
    const stack = useSelector(state => state?.gameUi?.game?.stackById[stackId]);
    const numStackIdsInGroup = useSelector(state => state?.gameUi?.game?.groupById?.[region.groupId]?.stackIds.length);
    const draggingToRegionType = useSelector(state => state?.playerUi?.dragging.toRegionType);
    const draggingFromGroupId = useSelector(state => state?.playerUi?.dragging.fromGroupId);
    const draggingToGroupId = useSelector(state => state?.playerUi?.dragging.toGroupId);
    const thisDrag = useSelector(state => state?.playerUi?.dragging?.stackId == stackId);
    const draggingEnd = useSelector(state => state?.playerUi?.dragging?.end);
    const touchMode = useSelector(state => state?.playerUi?.userSettings?.touchMode);
    const zoomFactor = useSelector(state => state?.playerUi?.userSettings?.zoomPercent)/100;
    const layout = useLayout();
    const rowSpacing = layout?.rowSpacing;
    const cardSize = layout?.cardSize;
    const playerN = useSelector(state => state?.playerUi?.playerN);
    const [isMousedOver, setIsMousedOver] = useState(false);
    console.log('Rendering Stack ', {stackIndex, region, layout, zoomFactor});
    var spacingFactor = touchMode ? 1.5 : 1;
    const { height, width } = useWindowDimensions();
    const aspectRatio = width/height;
    if (!stack) return null;
    const cardIds = stack.cardIds;
    const numCards = cardIds.length;
    const card0 = store.getState().gameUi.game.cardById[cardIds[0]];
    // Calculate size of stack for proper spacing. Changes base on group type and number of stack in group.
    const numStacksNonZero = Math.max(numStacksVisible, 1);
    const regionWidthPercent = convertToPercentage(region.width);
    const regionWidthInt = parseInt(regionWidthPercent.substring(0, regionWidthPercent.length - 1))
    const fanSpacingHoriz = (regionWidthInt-cardSize/2)*aspectRatio/numStacksNonZero;
    const cardWidth = card0?.sides[card0?.currentSide]?.width;
    const cardHeight = card0?.sides[card0?.currentSide]?.height;
    const stackHeight = cardHeight*cardSize*zoomFactor;
    const stackWidth = cardWidth*cardSize + ATTACHMENT_OFFSET * (numCards - 1);
    const stackWidthFan = Math.min(fanSpacingHoriz, cardWidth*cardSize*zoomFactor);
  
    const regionHeightPercent = convertToPercentage(region.height);
    const regionHeightInt = parseInt(regionHeightPercent.substring(0, regionHeightPercent.length - 1))
    const fanSpacingVert = (regionHeightInt-cardSize)/numStacksNonZero;
    const stackHeightFan = Math.min(fanSpacingVert, cardHeight*cardSize*zoomFactor);
    console.log("log1", stackWidth, stackWidthFan, region.type, region.direction);
    

    return (
      <Draggable 
        key={stackId} 
        draggableId={stackId} 
        index={stackIndex}
        isDragDisabled={playerN === null}>
        {(dragProvided, dragSnapshot) => {
          if (!draggingEnd && draggingToRegionType == "free" && dragSnapshot.isDropAnimating) {
            console.log('log3 started drag end from:', stackId, draggingFromGroupId);
            const result = {
              "draggableId": stackId,
              "type": "MANUAL",
              "source": {
                "index": stackIndex,
                "droppableId": draggingFromGroupId + "--" + region.type
              },
              "reason": "DROP",
              "mode": "FLUID",
              "destination": {
                "droppableId": draggingToGroupId + "--" + draggingToRegionType,
                "index": numStackIdsInGroup
              },
              "combine": null
            }
            onDragEnd(result);
          }
          const isCombined = Boolean(dragSnapshot.combineTargetFor)
          return(
            <NaturalDragAnimation
              style={dragProvided.draggableProps.style}
              snapshot={dragSnapshot}
              rotationMultiplier={1}>
              {style => {
                const updatedStyle = {...style}
                if (dragSnapshot.isDropAnimating && draggingToRegionType === "free") updatedStyle.transitionDuration = "0.0001s";
                if (isCombined) updatedStyle.zIndex = 6000;
                if (updatedStyle.transform && dragSnapshot.isDragging) updatedStyle.transform = updatedStyle.transform + " scale(1.1)";
                if (region.type === "free" && !dragSnapshot.isDragging) updatedStyle.transform = "none";
                updatedStyle.visibility = draggingToRegionType === "free" && ((thisDrag && style.transform === null) || dragSnapshot.isDropAnimating) ? "hidden" : "visible";
                updatedStyle.display = "inline-block";
                // Check if mouse is within this div

                if (region.type === "free") {
                  return(
                    <StackContainerFree
                      isDragging={dragSnapshot.isDragging}
                      isGroupedOver={isCombined}
                      stackWidth={stackWidth}
                      stackHeight={stackHeight}
                      stackLeft={stack.left}
                      stackTop={stack.top}
                      margin={0}
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      onMouseEnter={() => {console.log(`moused over ${stackId}`);setIsMousedOver(true)}}
                      onMouseLeave={() => setIsMousedOver(false)}
                      style={updatedStyle}
                    >
                      <Stack
                        stackId={stackId}
                        isDragging={dragSnapshot.isDragging}
                      />
                    </StackContainerFree>
                  )
                } else {
                  return(
                    <StackContainerSorted
                      isDragging={dragSnapshot.isDragging}
                      isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      stackWidth={(region.type === "fan" && region.direction == "horizontal") ? stackWidthFan : stackWidth}
                      stackHeight={(region.type === "fan" && region.direction == "vertical") ? stackHeightFan : stackHeight}
                      margin={region.type === "row" ? rowSpacing : 0}
                      onMouseEnter={() => setIsMousedOver(true)}
                      onMouseLeave={() => setIsMousedOver(false)}
                      style={updatedStyle}
                    >
                      <Stack
                        stackId={stackId}
                        isDragging={dragSnapshot.isDragging}
                      />
                    </StackContainerSorted>
                  )
                }
              }}
            </NaturalDragAnimation>
          )
        }}
      </Draggable>
    );
  })