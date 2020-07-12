import React from "react";
import styled from "@emotion/styled";
import CardView from "./CardView"
import { CARDSCALE } from "./Constants"


const Container = styled.div`
  position: relative;
  userSelect: none;
  padding: 0;
  cursor: default;
  min-width: ${props => props.stackWidth}vw;
  width: ${props => props.stackWidth}vw;
  min-height: 100%;
  height: 100%;
  z-index: 1;
  // min-width: ${CARDSCALE}vw;
  min-height:  ${CARDSCALE/0.75}vw;

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
function StackView(props) {
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
  } = props;

  console.log(group.id,group.stacks.length);
  var handSpacing = 100*0.8*0.8*0.8/(group.stacks.length);
  if (handSpacing > CARDSCALE) handSpacing = CARDSCALE;
  const stackWidth = group.type == "hand" ? handSpacing : CARDSCALE/0.75 + CARDSCALE/3*(stack.cards.length-1);

  //console.log('rendering stackview');
  //console.log(stackIndex);
  //console.log(stack.cards);
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
            <CardView
              broadcast={broadcast} 
              groupID={group.id} 
              group={group}
              stackIndex={stackIndex}
              cardIndex={cardIndex}
              inputCard={card} 
              key={card.id} 
            >
            </CardView>)
      })}
    </Container>
  );
}

export default StackView;
