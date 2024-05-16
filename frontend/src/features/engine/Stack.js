import React from "react";
import { useSelector } from 'react-redux';
import { Card } from "./Card";
import store from "../../store";
import { useGameDefinition } from "./hooks/useGameDefinition";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";

//left: ${props => props.left || 0}vh;
// background: ${props => (props.hidden) ? "red" : "blue"};
  // display: ${props => (props.hidden) ? "none" : "flex"};

export const Stack = React.memo(({
  stackId,
  isDragging,
}) => {
  const gameDef = useGameDefinition();
  const stack = useSelector(state => state?.gameUi?.game?.stackById[stackId]);
  const isHoveredOver = useSelector(state => state?.playerUi?.dragging.hoverOverStackId === stackId);
  const hoverOverDirection = useSelector(state => isHoveredOver ? state?.playerUi?.dragging.hoverOverDirection : null);
  console.log('Rendering StackId ', isHoveredOver, hoverOverDirection)
  if (!stack) return null;
  const cardIds = stack?.cardIds;

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
  return(
    <>
      {isHoveredOver && hoverOverDirection == "top" && <LinkIcon top="0" left="0" width="100%" height="6vh"  transform="translate(0%, -50%)"/>}
      {isHoveredOver && hoverOverDirection == "left" && <LinkIcon top="0" left="0" width="6vh"  height="100%" transform="translate(-50%, 0%)"/>}
      {isHoveredOver && hoverOverDirection == "right" && <LinkIcon top="0" left="100%" width="6vh"  height="100%" transform="translate(-50%, 0%)"/>}
      {isHoveredOver && hoverOverDirection == "bottom" && <LinkIcon top="100%" left="0" width="100%" height="6vh"  transform="translate(0%, -50%)"/>}
      {cardIds.map((cardId, cardIndex) => {
        return(
          <Card
            key={cardId}
            offset={offsets[cardIndex]}
            cardId={cardId}
            cardIndexFromGui={cardIndex}
            isDragging={(cardIndex === cardIds.length - 1) ? isDragging : false}
          />
        )
      })}
    </>
  );
});

const LinkIcon = React.memo(({
  top,
  left,
  width,
  height,
  transform,
}) => {
  return(
    <div
      className="flex items-center justify-center"
      style={{
        position: "absolute", 
        width: width,
        height: height,
        top: top,
        left: left,
        zIndex: 1e9,
        transform: transform,
      }}
    >
      <div
        className="flex items-center justify-center bg-gray-200"
        style={{
          width: "6vh",
          height: "6vh",
          border: "0.5vh solid black",
          borderRadius: "50%",
        }}
      >
        <FontAwesomeIcon className="w-full h-full" style={{fontSize: '4vh'}} icon={faLink}/>
      </div>
    </div>
  );
})
