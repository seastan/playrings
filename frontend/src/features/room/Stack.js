import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import styled from "@emotion/styled";
import { Card } from "./Card";
import { CARDSCALE } from "./Constants";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { ContextMenu, MenuItem, SubMenu, ContextMenuTrigger } from "react-contextmenu";


const Container = styled.div`
  position: relative;
  userSelect: none;
  padding: 0;
  min-width: ${props => props.stackWidth}vw;
  width: ${props => props.stackWidth}vw;
  min-height: 100%;
  height: 100%;
  min-height: ${props => props.cardSize/0.75}vw;
  display: flex;
`;

function getStyle(provided, style) {
  if (!style) {
    return provided.draggableProps.style;
  }

  return {
    ...provided.draggableProps.style,
    ...style
  };
}

// Previously this extended React.Component
// That was a good thing, because using React.PureComponent can hide
// issues with the selectors. However, moving it over can give considerable
// performance improvements when reordering big lists (400ms => 200ms)
// Need to be super sure we are not relying on PureComponent here for
// things we should be doing in the selector as we do not know if consumers
// will be using PureComponent

export const Stack = React.memo(({
  gameBroadcast,
  chatBroadcast,
  playerN,
  groupType,
  stackIndex,
  cardSize,
  stackId,
  numStacks,
}) => {
  const stackStore = state => state?.gameUi?.game?.stackById[stackId];
  const stack = useSelector(stackStore);
  if (!stack) return null;
  const cardIds = stack.cardIds;
  console.log('rendering stack ',stackIndex);
  // Calculate size of stack for proper spacing. Changes base on group type and number of stack in group.
  const numStacksNonZero = numStacks > 0 ? numStacks : 1;
  var handSpacing = 45/(numStacksNonZero);
  if (handSpacing > cardSize) handSpacing = cardSize;
  const stackWidth = groupType == "hand" ? handSpacing : cardSize/0.72 + cardSize/3*(cardIds.length-1);
  //const stackWidth = cardSize/0.72 + cardSize/3*(stack.cards.length-1);
  return (
    <Draggable 
      key={stackId} 
      draggableId={stackId} 
      index={stackIndex}
    >
      {(dragProvided, dragSnapshot) => (
        <Container
          isDragging={dragSnapshot.isDragging}
          isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
          stackWidth={stackWidth}
          cardSize={cardSize}
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          {...dragProvided.dragHandleProps}
          //style={{cursor: "default"}}
        >
          {cardIds.map((cardId, cardIndex) => {
            return(
              <Card
                key={cardId}
                gameBroadcast={gameBroadcast} 
                chatBroadcast={chatBroadcast} 
                playerN={playerN}
                cardId={cardId} 
                groupType={groupType}
                cardIndex={cardIndex}
                cardSize={cardSize}
              />
            )
        })}
        </Container>
      )}
    </Draggable>
  );
})
