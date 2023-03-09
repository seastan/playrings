import React, { useState } from "react";
import { useSelector } from 'react-redux';
import styled from "@emotion/styled";
import { Droppable } from "react-beautiful-dnd";
import { Stack } from "./Stack";
import { PileImage } from "./PileImage"

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
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding: 0.5vh;
  background: purple;
`;

const StacksList = React.memo(({
  isDraggingOver,
  isDraggingFrom,
  groupId,
  region,
  stackIds,
  mouseHere,
  selectedStackIndices,
  registerDivToArrowsContext
}) => {
  const draggingFromGroupId = useSelector(state => state?.playerUi?.draggingFromGroupId);
  const isPile = region.type == "pile";
  // Truncate stacked piles
  console.log("Rendering StacksList", {groupId, region, draggingFromGroupId});
  var stackIdsToShow = stackIds;
  if (isPile) {
    stackIdsToShow = [];
    if (stackIds.length > 0 && ((mouseHere && draggingFromGroupId === null) || draggingFromGroupId === groupId)) stackIdsToShow = [stackIds[0]];
  }

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
          registerDivToArrowsContext={registerDivToArrowsContext}
          hidden={isPile && isDraggingOver && !isDraggingFrom}/> 
      ) : null 
    ))
  ) 
});

export const Stacks = React.memo(({
  groupId,
  region,
  selectedStackIndices,
  registerDivToArrowsContext
}) => {
  console.log("Rendering Stacks for ",groupId, region);
  const [mouseHere, setMouseHere] = useState(false);
  const group = useSelector(state => state?.gameUi?.game?.groupById?.[groupId]);
  const stackIds = group.stackIds;
  return(
    <Droppable
      droppableId={groupId}
      key={groupId}
      isDropDisabled={false}
      isCombineEnabled={group.canHaveAttachments}
      direction={region.direction}>
      {(dropProvided, dropSnapshot) => (
        <Container
          isDraggingOver={dropSnapshot.isDraggingOver}
          isDropDisabled={false}
          isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
          {...dropProvided.droppableProps}
          direction={region.direction}
          onMouseEnter={() => setMouseHere(region.type === "pile" && true)} 
          onMouseLeave={() => setMouseHere(region.type === "pile" && false)}>
            <PileImage 
              region={region} 
              stackIds={stackIds} 
              isDraggingOver={dropSnapshot.isDraggingOver} 
              isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}>
            </PileImage>
            <DropZone ref={dropProvided.innerRef} direction={region.direction}>
              <StacksList
                isDraggingOver={dropSnapshot.isDraggingOver}
                isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
                groupId={groupId}
                region={region} 
                stackIds={stackIds}
                mouseHere={mouseHere}
                selectedStackIndices={(selectedStackIndices ? selectedStackIndices : [...Array(stackIds.length).keys()])}
                registerDivToArrowsContext={registerDivToArrowsContext}/>
              {dropProvided.placeholder}
            </DropZone>
        </Container>
      )}
    </Droppable>
  )
})


