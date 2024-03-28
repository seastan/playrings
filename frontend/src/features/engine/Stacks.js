import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import styled from "@emotion/styled";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { Stack } from "./Stack";
import { PileImage } from "./PileImage"
import { useLayout } from "./hooks/useLayout";
import { useGameDefinition } from "./hooks/useGameDefinition";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import store from "../../store";
import { ATTACHMENT_OFFSET } from "./functions/common";
import NaturalDragAnimation from 'natural-drag-animation-rbdnd';
import { Card } from "./Card";
import { setDraggingToRegionType, setDroppableRefs } from "../store/playerUiSlice";

const Container = styled.div`
  background-color: ${props => props.isDraggingOver ? "rgba(1,1,1,0.3)" : ""};
  moz-box-shadow: ${props => props.isDraggingOver ? "0 0 15px 12px rgba(1,1,1,0.3)" : ""};
  webkit-box-shadow: ${props => props.isDraggingOver ? "0 0 15px 12px rgba(1,1,1,0.3)" : ""};
  box-shadow: ${props => props.isDraggingOver ? "0 0 15px 12px rgba(1,1,1,0.3)" : ""};
  -webkit-transition: all 0.2s;
  -moz-transition: all 0.2s;
  -o-transition: all 0.2s;
  transition: all 0.2s;
  
  height: 100%;
  width: calc(100% - 17px);
  user-select: none;
  overflow-x: ${props => props.direction === "vertical" ? "hidden" : "auto"};
  overflow-y: ${props => props.direction === "vertical" ? "auto" : "hidden"};
  max-height: 100%;
  position: relative;
`;

export const DropZone = styled.div`
  /* stop the list collapsing when empty */
  position: absolute;
  display: ${props => props.direction === "vertical" ? "" : "flex"};
  overflow-x: none;
  width: calc(100% - ${props => props.margin}vh);
  height: 100%;
  min-height: 100%;
  padding: 0.5vh;
  margin: 0 0 0 ${props => props.margin}vh;
`;

const StacksList = React.memo(({
  isDraggingOver,
  isDraggingFrom,
  groupId,
  region,
  stackIds,
  mouseHere,
  selectedStackIndices
}) => {
  const isPile = region.type == "pile";
  const showTopCard = useSelector((state) => {
    const draggingFromGroupId = state?.playerUi?.dragging.fromGroupId;
    return isPile && stackIds.length > 0 && ((mouseHere && draggingFromGroupId === null) || draggingFromGroupId === groupId);
  });
  // Truncate stacked piles
  console.log("Rendering StacksList", {groupId, region});
  var stackIdsToShow = stackIds;
  if (isPile) stackIdsToShow = [];
  if (showTopCard) stackIdsToShow = [stackIds[0]];

  if (!stackIdsToShow) return null;
  return (
    stackIdsToShow?.map((stackId, stackIndex) => (
      (selectedStackIndices.includes(stackIndex)) ? (
        <Stack
          key={stackId}
          groupId={groupId}
          region={region}
          stackIndex={stackIndex}
          stackId={stackId}
          numStacks={selectedStackIndices.length}
          hidden={isPile && isDraggingOver && !isDraggingFrom}/> 
      ) : null 
    ))
  ) 
});

export const Stacks = React.memo(({
  groupId,
  region,
  selectedStackIndices
}) => {
  const containerRef = useRef(null);
  const dispatch = useDispatch();
  console.log("Rendering Stacks for ",groupId, region);
  const [mouseHere, setMouseHere] = useState(false);
  const layout = useLayout();
  const rowSpacing = layout?.rowSpacing;
  const group = useSelector(state => state?.gameUi?.game?.groupById?.[groupId]);
  const stackIds = group.stackIds;

  useEffect(() => {
    dispatch(setDroppableRefs({id: groupId, ref: containerRef.current}));
  }, [groupId]);


  if (region.type === "free") return <FreeZone groupId={groupId} region={region} containerRef={containerRef}/>
  else return(
    <Droppable
      droppableId={groupId}
      key={groupId}
      isDropDisabled={false}
      isCombineEnabled={group.canHaveAttachments}
      direction={region.direction}>
      {(dropProvided, dropSnapshot) => {
        if (dropSnapshot.isDraggingOver) dispatch(setDraggingToRegionType(region.type));
        return(
          <Container
            ref={containerRef}
            isDraggingOver={dropSnapshot.isDraggingOver}
            isDropDisabled={false}
            isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
            {...dropProvided.droppableProps}
            direction={region.direction}
            onMouseEnter={() => setMouseHere(region.type === "pile" && true)} 
            //onMouseLeave={() => setMouseHere(region.type === "pile" && false)}
            >
              <PileImage 
                region={region} 
                stackIds={stackIds} 
                isDraggingOver={dropSnapshot.isDraggingOver} 
                isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}>
              </PileImage>
              <DropZone 
                ref={dropProvided.innerRef} 
                direction={region.direction}
                margin={region.type === "row" ? rowSpacing/2 : 0}>
                <StacksList
                  isDraggingOver={dropSnapshot.isDraggingOver}
                  isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
                  groupId={groupId}
                  region={region} 
                  stackIds={stackIds}
                  mouseHere={mouseHere}
                  selectedStackIndices={(selectedStackIndices ? selectedStackIndices : [...Array(stackIds.length).keys()])}/>
                {dropProvided.placeholder}
              </DropZone>
          </Container>
        )
      }}
    </Droppable>
  )
})

export const FreeZone = React.memo(({
  groupId,
  region,
  containerRef
}) => {
  console.log("Rendering Free Stacks for ",groupId, region);
  const dispatch = useDispatch();
  const layout = useLayout();
  const rowSpacing = layout?.rowSpacing;
  const group = useSelector(state => state?.gameUi?.game?.groupById?.[groupId]);
  const stackIds = group.stackIds;

  const draggingStackId = useSelector(state => state?.playerUi?.dragging?.stackId);
  const draggingEnd = useSelector(state => state?.playerUi?.dragging?.end);
  const draggingEndDelay = useSelector(state => state?.playerUi?.dragging?.endDelay); 
  return(
    <Droppable
      droppableId={groupId}
      key={groupId}
      isDropDisabled={false}
      isCombineEnabled={false}
      direction={region.direction}>
      {(dropProvided, dropSnapshot) => {
        if (dropSnapshot.isDraggingOver) dispatch(setDraggingToRegionType(region.type));
        return(
        <Container
          ref={containerRef}
          isDraggingOver={dropSnapshot.isDraggingOver}
          isDropDisabled={false}
          isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
          {...dropProvided.droppableProps}
          direction={region.direction}
          //onMouseLeave={() => setMouseHere(region.type === "pile" && false)}
          >
            <PileImage 
              region={region} 
              stackIds={stackIds} 
              isDraggingOver={dropSnapshot.isDraggingOver} 
              isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}>
            </PileImage>
            <DropZone 
              ref={dropProvided.innerRef} 
              direction={region.direction}
              margin={0}>
              <FreeStacksList
                region={region} 
                stackIds={stackIds}/>
              {dropProvided.placeholder}
              
            </DropZone>
        </Container>)
      }}
    </Droppable>
  )
})

const FreeStacksList = React.memo(({
  region,
  stackIds
}) => {

  return (
    stackIds?.map((stackId, stackIndex) => (
      <FreeStack
        key={stackId}
        region={region}
        stackIndex={stackIndex}
        stackId={stackId}/> 
    ))
  ) 
});


export const FreeStackContainer = styled.div`
  position: absolute;
  userSelect: none;
  margin: 0vh ${props => props.margin}vh 0vh 0vh;
  left: ${props => props.stackLeft}%;
  top: ${props => props.stackTop}%;
  width: ${props => props.stackWidth}vh;
  height: ${props => props.stackHeight}vh;
`;




export const FreeStack = React.memo(({
  region,
  stackIndex,
  stackId,
}) => {
  const gameDef = useGameDefinition();
  const dispatch = useDispatch();
  const stack = useSelector(state => state?.gameUi?.game?.stackById[stackId]);
  const draggingToRegionType = useSelector(state => state?.playerUi?.dragging.toRegionType);
  const touchMode = useSelector(state => state?.playerUi?.userSettings?.touchMode);
  const thisDrag = useSelector(state => state?.playerUi?.dragging?.stackId == stackId);
  const stopDrag = useSelector(state => state?.playerUi?.dragging?.end);
  const stopDragDelay = useSelector(state => state?.playerUi?.dragging?.endDelay); 
  const zoomFactor = useSelector(state => state?.playerUi?.zoomPercent)/100;
  const layout = useLayout();
  const rowSpacing = layout?.rowSpacing;
  const cardSize = layout?.cardSize;
  const playerN = useSelector(state => state?.playerUi?.playerN);
  const [isMousedOver, setIsMousedOver] = useState(false);
  console.log('Rendering Free Stack ', {stack, region, layout});
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
  const cardWidth = card0?.sides[card0?.currentSide]?.width;
  const cardHeight = card0?.sides[card0?.currentSide]?.height;
  const stackHeight = cardHeight*cardSize*zoomFactor;
  const stackWidth = cardWidth*cardSize + ATTACHMENT_OFFSET * (numCards - 1);

  var backgroundColor = "white";
  if (thisDrag && !stopDrag) {
    backgroundColor = "red";
  } else if (thisDrag && !stopDragDelay) {
    backgroundColor = "green";
  }
  
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
            if (!dragSnapshot.isDragging) updatedStyle.transform = "none";
            updatedStyle.visibility = draggingToRegionType === "free" && ((thisDrag && style.transform === null) || dragSnapshot.isDropAnimating) ? "hidden" : "visible";
            return(
              <FreeStackContainer
                isDragging={dragSnapshot.isDragging}
                isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
                stackWidth={stackWidth}
                stackHeight={stackHeight}
                stackLeft={stack.left}
                stackTop={stack.top}
                margin={0}
                ref={dragProvided.innerRef}
                {...dragProvided.draggableProps}
                {...dragProvided.dragHandleProps}
                onMouseEnter={() => setIsMousedOver(true)}
                onMouseLeave={() => setIsMousedOver(false)}
                style={updatedStyle}>
                {cardIds.map((cardId, cardIndex) => {
                  return(
                    // <div 
                    //   style={{
                    //     width: "150px",
                    //     height: "250px",
                    //     backgroundColor: backgroundColor
                    //   }}>
                    //     origTransform: {JSON.stringify(style.transform)}
                    //     updatedTransform: {JSON.stringify(updatedStyle.transform)}
                    //     tempTransform: {JSON.stringify(tempTransform)}
                    //     isDragging: {JSON.stringify(dragSnapshot.isDragging)}
                    //     stopDrag: {JSON.stringify(stopDrag)}
                    //     stopDragDelay: {JSON.stringify(stopDragDelay)}
                    //     thisDrag: {JSON.stringify(thisDrag)}
                    //     dropAnimating: {JSON.stringify(dragSnapshot.isDropAnimating)}
                    // </div>

                    <Card
                      key={cardId}
                      offset={offsets[cardIndex]}
                      cardId={cardId}
                      cardIndexFromGui={cardIndex}
                      isDragging={(cardIndex === cardIds.length - 1) ? dragSnapshot.isDragging : false}/>
                  )
              })}
              </FreeStackContainer>
            )}}
        </NaturalDragAnimation>
      )}
    </Draggable>
  );
})
