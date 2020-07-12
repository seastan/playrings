import React from "react";
import styled from "@emotion/styled";
import { CARDSCALE, playerBackSRC, encounterBackSRC} from "./Constants"

export function getCardBackSRC(card) {
    var src="";
    if (card.srcBack === null || card.srcBack === "") {
        if (card.deckType === "Player") src = playerBackSRC;
        if (card.deckType === "Encounter") src = encounterBackSRC;
    } else {
        src = card.srcBack
    }
    return src;
}

const Container = styled.div`
    width: ${CARDSCALE}vw;
    height: ${CARDSCALE/0.72}vw;
    border-width: 0px;
    border-color: black;
    position: absolute;
    margin: 0 0 0 0.75vw;
    background: url(${props => (props.src)}) no-repeat; 
    background-size: contain;
`;

function CardBack(props) {
  const {
    group,
    isDraggingOver,
    isDraggingFrom
  } = props;

  var src = "";
  if (group.type=="deck" && group.stacks.length>1) {
      src = getCardBackSRC(group.stacks[1].cards[0])
  } else if (group.type=="deck" && group.stacks.length===1 && isDraggingOver && !isDraggingFrom) {
      src = getCardBackSRC(group.stacks[0].cards[0])
  } else if (group.type=="discard" && group.stacks.length>1) {
      src = group.stacks[1].cards[0].src
  } else if (group.type=="discard" && group.stacks.length===1 && isDraggingOver && !isDraggingFrom) {
      src = group.stacks[0].cards[0].src
  }
  return (
    <Container src={src}/>
  );
}

export default CardBack;
