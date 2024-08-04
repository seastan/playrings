import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Draggable } from "@seastan/react-beautiful-dnd";
//import { Draggable } from "seastan-react-beautiful-dnd";
import { useLayout } from "./hooks/useLayout";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import store from "../../store";
import { ATTACHMENT_OFFSET, convertToPercentage } from "./functions/common";
import NaturalDragAnimation from 'natural-drag-animation-rbdnd';
import styled from "@emotion/styled";
import { Stack } from "./Stack";
import { getGroupIdAndRegionType } from "./Reorder";
import { useOffsetTotalsAndAmounts } from "./hooks/useOffsetTotalsAndAmounts";
import { usePlayerN } from "./hooks/usePlayerN";
import { setDraggingDefault, setDraggingEndDelay, setDraggingStarted, setDragStep, setStatusText, setTempDragStack } from "../store/playerUiSlice";
import { useGetRegionFromId } from "./hooks/useGetRegionFromId";

const StackContainerFree = styled.div`
  position: absolute;
  float: left;
  userSelect: none;
  margin: 0dvh ${props => props.margin}dvh 0dvh 0dvh;
  left: ${props => props.stackLeft};
  top: ${props => props.stackTop};
  width: ${props => props.stackWidth}dvh;
  height: ${props => props.stackHeight}dvh;
  opacity: ${props => props.isGroupedOver ? 0.4 : 1};
`;

export const StackContainerSorted = styled.div`
  position: relative;
  userSelect: none;
  width: ${props => props.stackWidth}dvh;
  height: ${props => props.stackHeight}dvh;
  margin: 0dvh ${props => props.margin}dvh 0dvh 0dvh;
  opacity: ${props => props.isGroupedOver ? 0.4 : 1};
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
    //const dispatch = useDispatch();
    const dispatch = useDispatch();
    const stack = useSelector(state => state?.gameUi?.game?.stackById[stackId]);
    const numStackIdsInGroup = useSelector(state => state?.gameUi?.game?.groupById?.[region.groupId]?.stackIds.length);
    const tempDragStackIdIsThisStackId = useSelector(state => state?.playerUi?.tempDragStack?.stackId === stackId);
    const thisDrag = useSelector(state => state?.playerUi?.dragging?.stackId == stackId);
    // const draggingEnd = useSelector(state => state?.playerUi?.dragging?.end);
    // const draggingEndDelay = useSelector(state => state?.playerUi?.dragging?.endDelay);
    const touchMode = useSelector(state => state?.playerUi?.userSettings?.touchMode);
    const regionCardSizeFactor = region.cardSizeFactor || 1;
    const zoomFactor = useSelector(state => state?.playerUi?.userSettings?.zoomPercent)/100 * regionCardSizeFactor;
    const isCombined = useSelector(state => ((state?.playerUi?.dragging?.stackId === stackId) && (state?.playerUi?.dragging?.hoverOverStackId !== null)));
    const playerN = usePlayerN();
    const getRegionFromId = useGetRegionFromId();

    // console.log("renda 1 ")
    // useEffect(() => {
    //   console.log("renda 2 ", tempDragStackIdIsThisStackId)
    //   if (tempDragStackIdIsThisStackId && setDraggingEndDelay) {
    //     console.log("renda 3 ")
    //     // dispatch(setDraggingEndDelay(false));
    //     // dispatch(setTempDragStack(null));
    //   }
    // }, [tempDragStackIdIsThisStackId]);

    const layout = useLayout();
    const rowSpacing = layout?.rowSpacing;
    const cardSize = layout?.cardSize;
    console.log('Rendering StackDraggable in ', region.groupId, stack);
    var spacingFactor = touchMode ? 1.5 : 1;
    const { height, width } = useWindowDimensions();
    const aspectRatio = width/height;
    const cardIds = stack?.cardIds || [];
    const card0 = store.getState().gameUi.game.cardById[cardIds[0]];
    // Calculate size of stack for proper spacing. Changes base on group type and number of stack in group.
    const {offsetTotals, offsetAmounts, stackEdges} = useOffsetTotalsAndAmounts(stackId);

    if (!stack) return null;
    console.log("stackEdges", stackEdges)
    //if (tempDragStackIdIsThisStackId) return null;

    const numStacksNonZero = Math.max(numStacksVisible, 1);
    const regionWidthPercent = convertToPercentage(region.width);
    const regionWidthInt = parseInt(regionWidthPercent.substring(0, regionWidthPercent.length - 1))
    const fanSpacingHoriz = (regionWidthInt-cardSize/2)*aspectRatio/numStacksNonZero;
    const cardWidth = card0?.sides[card0?.currentSide]?.width;
    const cardHeight = card0?.sides[card0?.currentSide]?.height;
    const stackHeight = (stackEdges.bottom - stackEdges.top) * zoomFactor;
    const stackTopOffset = stackEdges.top * zoomFactor;
    const stackTop = region.type === "free" ? `calc(${stack.top} + ${stackTopOffset}dvh)` : stack.top;
    //const stackWidth = cardWidth*cardSize + ATTACHMENT_OFFSET * (numCards - 1);
    const stackWidth = (stackEdges.right - stackEdges.left) * zoomFactor;
    const stackWidthFan = Math.min(fanSpacingHoriz, cardWidth*cardSize*zoomFactor);
    const stackLeftOffset = stackEdges.left * zoomFactor;
    const stackLeft = region.type === "free" ? `calc(${stack.left} + ${stackLeftOffset}dvh)` : stack.left;
    console.log("stackLeft", stackLeft, stack.left, stackLeftOffset)
  
    const regionHeightPercent = convertToPercentage(region.height);
    const regionHeightInt = parseInt(regionHeightPercent.substring(0, regionHeightPercent.length - 1))
    const fanSpacingVert = (regionHeightInt-cardSize)/numStacksNonZero;
    const stackHeightFan = Math.min(fanSpacingVert, cardHeight*cardSize*zoomFactor);

    const constProvided = {
      "draggableProps": {
        "data-rbd-draggable-context-id": "0",
        "data-rbd-draggable-id": "88e6b3eb-c146-4603-a9f0-520efdc18c66",
        "style": {
          "transform": null,
          "transition": null
        },
        "onTransitionEnd": null
      },
      "dragHandleProps": {
        "tabIndex": 0,
        "role": "button",
        "aria-describedby": "rbd-hidden-text-0-hidden-text-0",
        "data-rbd-drag-handle-draggable-id": "88e6b3eb-c146-4603-a9f0-520efdc18c66",
        "data-rbd-drag-handle-context-id": "0",
        "draggable": false
      }
    }

    const constSnapshot = {
      "isDragging": false,
      "isDropAnimating": false,
      "isClone": false,
      "dropAnimation": null,
      "mode": null,
      "draggingOver": null,
      "combineTargetFor": null,
      "combineWith": null
    }

    return (
      <Draggable 
        key={stackId} 
        draggableId={stackId} 
        index={stackIndex}
        isDragDisabled={playerN === null}>
        {(dragProvided, dragSnapshot) => {
          console.log("Attempted drag 1")
          if (card0.sides["A"].name.includes("Roland Banks")) console.log("Roland drag", {dragSnapshot, dragProvided});

          const draggingStackId = store.getState().playerUi?.dragging?.stackId;
          const dragStep = store.getState().playerUi?.dragging?.dragStep;
          const draggingStarted = store.getState().playerUi?.dragging?.started;
          if (dragStep === "beforeDragStart" && dragSnapshot.isDragging) {
            dispatch(setDragStep("dragging"));
          }

          // End of animation
          if (stackId === draggingStackId && dragStep === "dropAnimating" && !dragSnapshot.isDropAnimating) {
            //if (stackId === draggingStackId && draggingStarted && !dragSnapshot.isDragging && !dragSnapshot.isDropAnimating) {
              alert("end of animation")

            dispatch(setDraggingDefault())
            dispatch(setTempDragStack(null))
          }
            
          // Mouse let go
          //const draggingEnd = store.getState().playerUi?.dragging?.end;
          // if (store.getState().playerUi?.dragging?.prevStackId) {
          //   dragProvided = constProvided;
          //   dragSnapshot = constSnapshot;
          // }

          console.log("Attempted drag 1", dragSnapshot.isDropAnimating);
          // Mouse let go
          if (stackId === draggingStackId && dragStep === "dragging" && dragSnapshot.isDropAnimating && onDragEnd) {
            alert("mouse let go")
            dispatch(setDragStep("dropAnimating"));
            const fromDroppableId = store.getState().playerUi?.dragging?.fromDroppableId;
            const hoverOverStackId = store.getState().playerUi?.dragging?.hoverOverStackId;
            const hoverOverDirection = store.getState().playerUi?.dragging?.hoverOverDirection;
            const hoverOverDroppableId = store.getState().playerUi?.dragging?.hoverOverDroppableId;
            const toRegion = getRegionFromId(hoverOverDroppableId);
            const toRegionType = toRegion.type;
            //const [toGroupId, toRegionType, toRegionDirection] = getGroupIdAndRegionType(hoverOverDroppableId);
            console.log('onDragEnd hoverOverStackId 2:',{hoverOverStackId, toRegionType});
            if (hoverOverStackId) {
              const result = {
                "draggableId": "6920565a-6485-4f5b-b0f7-66e36286efee",
                "type": "DEFAULT",
                "source": {
                  "index": stackIndex,
                  "droppableId": fromDroppableId
                },
                "reason": "DROP",
                "mode": "FLUID",
                "destination": null,
                "combine": {
                  "draggableId": hoverOverStackId,
                  "droppableId": hoverOverDroppableId,
                  "direction": hoverOverDirection
                }
              }
              onDragEnd(result);
            } else if (toRegionType == "free") {
              const result = {
                "draggableId": stackId,
                "type": "MANUAL",
                "source": {
                  "index": stackIndex,
                  "droppableId": fromDroppableId
                },
                "reason": "DROP",
                "mode": "FLUID",
                "destination": {
                  "droppableId": hoverOverDroppableId,
                  "index": numStackIdsInGroup
                },
                "combine": null
              }
              onDragEnd(result);
            }
          }
          //const isCombined = Boolean(dragSnapshot.combineTargetFor)
          const draggingToDroppableId = store.getState().playerUi?.dragging?.hoverOverDroppableId;
          var draggingToFree = false;
          if (draggingToDroppableId) {
            const toRegion = getRegionFromId(draggingToDroppableId);
            const toRegionType = toRegion.type;
            //const [toGroupId, toRegionType, toRegionDirection] = getGroupIdAndRegionType(draggingToDroppableId);
            draggingToFree = toRegionType === "free";
          }
          return(
            <NaturalDragAnimation
              style={dragProvided.draggableProps.style}
              snapshot={dragSnapshot}
              rotationMultiplier={1}>
              {style => {
                var updatedStyle = {...style}
                if (dragSnapshot.isDropAnimating && draggingToFree) updatedStyle.transitionDuration = "1.0001s";
                //if (isCombined) updatedStyle.zIndex = 0;
                if (updatedStyle.transform && dragSnapshot.isDragging) updatedStyle.transform = updatedStyle.transform + " scale(1.3)";
                if (region.type === "free" && !dragSnapshot.isDragging) updatedStyle.transform = "none";
                if (dragSnapshot.isDropAnimating) updatedStyle.opacity = "0.3";
                //if (updatedStyle.transition !== null) updatedStyle.transition = null;
                //if (updatedStyle.zIndex === 4500) updatedStyle = {"transform":"none","transition":null}
                //dispatch(setStatusText(JSON.stringify(dragSnapshot)))
                //if (draggingEnd) updatedStyle.opacity = 0.1;
                // If isInBrowseGroup, add -50% to transform Y
                //if (isInBrowseGroup && dragSnapshot.isDragging) updatedStyle.transform = updatedStyle.transform + " translate(0%, -50dvh)";
                //updatedStyle.visibility = draggingToFree && ((thisDrag && style.transform === null) || dragSnapshot.isDropAnimating) ? "hidden" : "visible";
                //if (region.direction === "horizontal") updatedStyle.display = "inline-block";
                //if (tempDragStackIdIsThisStackId) updatedStyle.visibility = "hidden";
                // Check if mouse is within this div

                if (region.type === "free") {
                  return(
                    <StackContainerFree
                      isDragging={dragSnapshot.isDragging}
                      isGroupedOver={isCombined}
                      stackWidth={stackWidth}
                      stackHeight={stackHeight}
                      stackLeft={stackLeft}
                      stackTop={stackTop}
                      margin={0}
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      style={updatedStyle}
                    >
                      <Stack
                        stackId={stackId}
                        isDragging={dragSnapshot.isDragging}
                        stackZoomFactor={zoomFactor}
                      />
                    </StackContainerFree>
                  )
                } else {
                  return(
                    <StackContainerSorted
                      isDragging={dragSnapshot.isDragging}
                      isGroupedOver={isCombined}
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      stackWidth={(region.type === "fan" && region.direction == "horizontal") ? stackWidthFan : stackWidth}
                      stackHeight={(region.type === "fan" && region.direction == "vertical") ? stackHeightFan : stackHeight}
                      margin={region.type === "row" ? rowSpacing*zoomFactor : 0}
                      style={updatedStyle}
                    >
                      <Stack
                        stackId={stackId}
                        isDragging={dragSnapshot.isDragging}
                        stackZoomFactor={zoomFactor}
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