import React from "react";
import styled from "@emotion/styled";
import { Droppable, Draggable } from "react-beautiful-dnd";
import Stack from "./Stack";
import { grid } from "./Constants";
import Title from "./Title";

export const getBackgroundColor = (isDraggingOver, isDraggingFrom) => {
  if (isDraggingOver) {
    return 'hotpink';
  }
  if (isDraggingFrom) {
    return 'teal';
  }
  return 'lime';
};

const Wrapper = styled.div`
  background-color: ${props =>
    getBackgroundColor(props.isDraggingOver, props.isDraggingFrom)};
  opacity: ${({ isDropDisabled }) => (isDropDisabled ? 0.5 : "inherit")};
  padding: ${grid}px;
  border: ${grid}px;
  padding-bottom: 0;
  transition: background-color 0.2s ease, opacity 0.1s ease;
  user-select: none;
  overflow-x: auto;
`;

const scrollContainerHeight = 250;

const DropZone = styled.div`
  /* stop the list collapsing when empty */
  display: flex;
  /*
    not relying on the items for a margin-bottom
    as it will collapse when the list is empty
  */
  padding-bottom: ${grid}px;
`;

/* stylelint-disable block-no-empty */
const Container = styled.div``;
/* stylelint-enable */

const InnerQuoteList = React.memo(function InnerQuoteList(props) {
  console.log("t");
  console.log(props);
  return props.quotes.map((quote, index) => (
    <Draggable key={quote.id} draggableId={quote.id} index={index}>
      {(dragProvided, dragSnapshot) => (
        <Stack
          key={quote.id}
          quote={quote}
          isDragging={dragSnapshot.isDragging}
          isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
          provided={dragProvided}
        />
      )}
    </Draggable>
  ));
});

function InnerList(props) {
  const { stacks, quotes, dropProvided } = props;
  const title = props.title ? <Title>{props.title}</Title> : null;

  return (
    <Container>
      {title}
      <DropZone ref={dropProvided.innerRef}>
        <InnerQuoteList stacks={stacks} quotes={quotes} />
        {dropProvided.placeholder}
      </DropZone>
    </Container>
  );
}

export default function Stacks(props) {
  const {
    stacks,
    ignoreContainerClipping,
    isDropDisabled,
    isCombineEnabled,
    listId = "LIST",
    listType,
    style,
    quotes,
    title,
    useClone
  } = props;

  return (
    <Droppable
      droppableId={listId}
      type={listType}
      ignoreContainerClipping={ignoreContainerClipping}
      isDropDisabled={isDropDisabled}
      isCombineEnabled={isCombineEnabled}
      direction="horizontal"
    >
      {(dropProvided, dropSnapshot) => (
        <Wrapper
          style={style}
          isDraggingOver={dropSnapshot.isDraggingOver}
          isDropDisabled={isDropDisabled}
          isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
          {...dropProvided.droppableProps}
        >
            <InnerList
                stacks={stacks}
                quotes={quotes}
                title={title}
                dropProvided={dropProvided}
            />
        </Wrapper>
      )}
    </Droppable>
  );
}
