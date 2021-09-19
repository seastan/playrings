import React from "react";
import { useSelector } from 'react-redux';
import styled from "@emotion/styled";
import { Card } from "./Card";
import { Draggable } from "react-beautiful-dnd";
import { useTouchMode } from "../../contexts/TouchModeContext";
import { CARDSCALE } from "./Constants";
import useWindowDimensions from "../../hooks/useWindowDimensions";

const Container = styled.div`
  position: relative;
  userSelect: none;
  padding: 0;
  min-width: ${props => props.stackWidth}vh;
  width: ${props => props.stackWidth}vh;
  height: ${props => (props.groupType === "vertical") ? `${props.cardSize/3}vh` : "100%"};
  display: flex;
`;

export const Stack = React.memo(({
  gameBroadcast,
  chatBroadcast,
  playerN,
  groupId,
  groupType,
  stackIndex,
  cardSize,
  stackId,
  numStacks,
  registerDivToArrowsContext
}) => {
  console.log('Rendering Stack ',stackIndex);
  const stackStore = state => state?.gameUi?.game?.stackById[stackId];
  const stack = useSelector(stackStore);
  const touchMode = useTouchMode();
  const touchModeSpacingFactor = touchMode ? 1.5 : 1;
  const { height, width } = useWindowDimensions();
  const aspectRatio = width/height;
  if (!stack) return null;
  const cardIds = stack.cardIds;
  // Calculate size of stack for proper spacing. Changes base on group type and number of stack in group.
  const numStacksNonZero = numStacks > 0 ? numStacks : 1;
  var handSpacing = 45*aspectRatio/(numStacksNonZero);
  if (handSpacing > cardSize) handSpacing = cardSize;
  const stackWidth = groupType === "hand" ? handSpacing : cardSize/0.72 + cardSize*touchModeSpacingFactor/3*(cardIds.length-1);
  //const stackWidth = cardSize/0.72 + cardSize/3*(stack.cards.length-1);
  return (
    <Draggable 
      key={stackId} 
      draggableId={stackId} 
      index={stackIndex}
      isDragDisabled={playerN === null}
    >
      {(dragProvided, dragSnapshot) => (
        <Container
          isDragging={dragSnapshot.isDragging}
          isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
          stackWidth={stackWidth}
          groupType={groupType}
          cardSize={cardSize}
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          {...dragProvided.dragHandleProps}
        >
          {cardIds.map((cardId, cardIndex) => {
            return(
              <Card
                key={cardId}
                gameBroadcast={gameBroadcast} 
                chatBroadcast={chatBroadcast} 
                playerN={playerN}
                groupId={groupId}
                groupType={groupType}
                cardId={cardId} 
                cardIndex={cardIndex}
                cardSize={cardSize}
                registerDivToArrowsContext={registerDivToArrowsContext}
              />
            )
        })}
        </Container>
      )}
    </Draggable>
  );
})
