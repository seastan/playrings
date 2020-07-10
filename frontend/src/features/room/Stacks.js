import React from "react";
import styled from "@emotion/styled";
import { Droppable, Draggable } from "react-beautiful-dnd";
import StackView from "./StackView";

export const getBackgroundColor = (isDraggingOver, isDraggingFrom) => {
  if (isDraggingOver) {
    return 'hotpink';
  }
  if (isDraggingFrom) {
    return '';
  }
  return 'lime';
};

const Wrapper = styled.div`
  background-color: ${props => props.isDraggingOver ? "rgba(1,1,1,0.4)" : ""};
  padding: 0 0 0 0;
  height: 87%;
  user-select: none;
  overflow-x: ${props => (props.type=="deck" || props.type=="discard") ? "none" : "auto"};
`;

const DropZone = styled.div`
  /* stop the list collapsing when empty */
  display: ${props => (props.type=="deck" || props.type=="discard") ? "" : "flex"};
  width: 100%;
  min-height: 100%;
  padding: 0 0 0 0.75vw;
`;

/* stylelint-disable block-no-empty */
const Container = styled.div`
  height: 100%;
`;
/* stylelint-enable */

const InnerQuoteList = React.memo(function InnerQuoteList(props) {
  const pile = (props.group.type=="deck" || props.group.type=="discard")

  console.log(props.group.id,"STACKS",props.stacks);
  console.log(props.isDraggingOver,props.isDraggingFrom)
  var stacks;
  if (pile && props.isDraggingOver && !props.isDraggingFrom) stacks = [];
  else if (pile && props.stacks.length>1) stacks = [props.stacks[0]]
  else stacks = props.stacks;
  console.log(stacks);
  return stacks?.map((stack, stackIndex) => (
    <Draggable key={stack.id} draggableId={stack.id} index={stackIndex}>
      {(dragProvided, dragSnapshot) => (
        <StackView
          broadcast={props.broadcast}
          group={props.group}
          stackIndex={stackIndex}
          stack={stack}
          key={stack.id}
          isDragging={dragSnapshot.isDragging}
          isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
          provided={dragProvided}
        />
      )}
    </Draggable>
  ));
});

function InnerList(props) {
  const { isDraggingOver, isDraggingFrom, broadcast, group, stacks, dropProvided } = props;

  return (
    <Container>
      <DropZone ref={dropProvided.innerRef} group={group}>
        <InnerQuoteList 
          isDraggingOver={isDraggingOver}
          isDraggingFrom={isDraggingFrom}
          broadcast={broadcast} 
          group={group} 
          stacks={stacks}
        />
        {dropProvided.placeholder}
      </DropZone>
    </Container>
  );
}

export default function Stacks(props) {
  const {
    broadcast,
    group,
    isDropDisabled,
    isCombineEnabled,
  } = props;

  return (
    <Droppable
      droppableId={group.id}
      key={group.id}
      isDropDisabled={isDropDisabled}
      isCombineEnabled={isCombineEnabled}
      direction={group.type=="deck" || group.type=="discard" ? "vertical" : "horizontal"}
    >
      {(dropProvided, dropSnapshot) => (
        <Wrapper
          isDraggingOver={dropSnapshot.isDraggingOver}
          isDropDisabled={isDropDisabled}
          isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
          {...dropProvided.droppableProps}
          type={group.type}
        >
            <InnerList
                isDraggingOver={dropSnapshot.isDraggingOver}
                isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
                broadcast={broadcast}
                group={group}
                stacks={group.stacks}
                dropProvided={dropProvided}
            />
        </Wrapper>
      )}
    </Droppable>
  );
}
