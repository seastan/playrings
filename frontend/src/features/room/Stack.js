import React from "react";
import styled from "@emotion/styled";
import { borderRadius, grid } from "./Constants";
import { Card, CARDSCALE } from "./Card"

const getBorderColor = (isDragging) =>
  isDragging ? "black" : "transparent";

const imageSize = 40;



const Container = styled.div`
  position: relative;
  userSelect: none;
  padding: 0;
  cursor: default;
  margin: 4px 4px 0 0;
  min-width: ${props => props.stackWidth}vw;
  width: ${props => props.stackWidth}vw;
  min-height: 100%;
  height: 100%;

  // min-width: ${4.5}vw;
  min-height:  ${4.5/0.7}vw;

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
// issues with the selectors. However, moving it over does can considerable
// performance improvements when reordering big lists (400ms => 200ms)
// Need to be super sure we are not relying on PureComponent here for
// things we should be doing in the selector as we do not know if consumers
// will be using PureComponent
function Stack(props) {
  const {
    broadcast,
    group,
    stackIndex,
    stack,
    isDragging,
    isGroupedOver,
    provided,
    style,
    isClone,
    index,
    activeCard,
    setActiveCard,
  } = props;

  const stackWidth = CARDSCALE/0.75 + CARDSCALE/3*(stack.cards.length-1)

  return (
    <Container
      isDragging={isDragging}
      isGroupedOver={isGroupedOver}
      isClone={isClone}
      stackWidth={stackWidth}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={getStyle(provided, style)}
      data-is-dragging={isDragging}
      data-testid={stack.id}
      data-index={index}
    >
      {stack.cards.map((card, cardIndex) => {
          return(
            <Card 
              broadcast={broadcast} 
              group={group} 
              stackIndex={stackIndex}
              cardIndex={cardIndex}
              inputCard={card} 
              key={card.id} 
              activeCard={activeCard} 
              setActiveCard={setActiveCard}
            >
            </Card>)
      })}
    </Container>
  );
}

export default Stack;
