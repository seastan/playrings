import React from "react";
import styled from "@emotion/styled";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Stack } from "./Stack";
import CardBack from "./CardBack"

const Wrapper = styled.div`
  background-color: ${props => props.isDraggingOver ? "rgba(1,1,1,0.3)" : ""};
  moz-box-shadow: ${props => props.isDraggingOver ? "0 0 15px 12px rgba(1,1,1,0.3)" : ""};
  webkit-box-shadow: ${props => props.isDraggingOver ? "0 0 15px 12px rgba(1,1,1,0.3)" : ""};
  box-shadow: ${props => props.isDraggingOver ? "0 0 15px 12px rgba(1,1,1,0.3)" : ""};
  -webkit-transition: all 0.2s;
  -moz-transition: all 0.2s;
  -o-transition: all 0.2s;
  transition: all 0.2s;
  padding: 0 0 0 0;
  height: 100%;
  user-select: none;
  overflow-x: ${props => (props.groupType=="deck" || props.groupType=="discard") ? "none" : "auto"};
  overflow-y: hidden;
  scrollbar-color: rgba(1,1,1,0.8) rgba(1,1,1,0);
  max-height: 100%;
  position: relative;
`;

const DropZone = styled.div`
  /* stop the list collapsing when empty */
  display: ${props => (props.groupType=="deck" || props.groupType=="discard") ? "" : "flex"};
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding: 0 0 0 0;
`;

/* stylelint-disable block-no-empty */
const Container = styled.div`
  height: 100%;
`;
/* stylelint-enable */

const StacksList = React.memo(({
  isDraggingOver,
  isDraggingFrom,
  gameBroadcast,
  chatBroadcast,
  playerN,
  groupType,
  cardSize,
  stackIds,
  selectedStackIndices,
}) => {
  const pile = (groupType=="deck" || groupType=="discard")
  //return(<div>{groupType}</div>)
  // Truncate stacked piles
  var stackIdsToShow;
  if (pile && isDraggingOver && !isDraggingFrom) stackIdsToShow = [];
  else if (pile && stackIds.length>1) stackIdsToShow = [stackIds[0]]
  else stackIdsToShow = stackIds;
  if (!stackIdsToShow) return null;
  console.log('rendering stacks');
  return (
    stackIdsToShow?.map((stackId, stackIndex) => (
      (selectedStackIndices.includes(stackIndex)) ? (
        <Stack
          key={stackId}
          gameBroadcast={gameBroadcast}
          chatBroadcast={chatBroadcast}
          playerN={playerN}
          groupType={groupType}
          stackIndex={stackIndex}
          cardSize={cardSize}
          stackId={stackId}
          numStacks={selectedStackIndices.length}
        /> 
      ) : null 
    ))
  ) 
});

export const Stacks = React.memo(({
  gameBroadcast,
  chatBroadcast,
  playerN,
  groupId,
  stackIds,
  groupType,
  cardSize,
  isCombineEnabled,
  selectedStackIndices,
}) => {
  console.log("rendering stacks ",groupId)
  return(
    <Droppable
      droppableId={groupId}
      key={groupId}
      isDropDisabled={false}
      isCombineEnabled={isCombineEnabled}
      direction={groupType=="deck" || groupType=="discard" ? "vertical" : "horizontal"}
    >
      {(dropProvided, dropSnapshot) => (
        <Wrapper
          isDraggingOver={dropSnapshot.isDraggingOver}
          isDropDisabled={false}
          isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
          {...dropProvided.droppableProps}
          groupType={groupType}
        >
          <Container>
            <CardBack 
              groupType={groupType} 
              stackIds={stackIds} 
              isDraggingOver={dropSnapshot.isDraggingOver} 
              isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}>
            </CardBack>
            <DropZone ref={dropProvided.innerRef} groupType={groupType}>
              <StacksList
                isDraggingOver={dropSnapshot.isDraggingOver}
                isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
                gameBroadcast={gameBroadcast} 
                chatBroadcast={chatBroadcast} 
                playerN={playerN}
                groupId={groupId}
                groupType={groupType} 
                cardSize={cardSize}
                stackIds={stackIds}
                selectedStackIndices={selectedStackIndices}
              />
              {dropProvided.placeholder}
            </DropZone>
          </Container>
        </Wrapper>
      )}
    </Droppable>
  )
})


