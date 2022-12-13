/* The image shown for a pile of cards */

import React from "react";
import { useSelector } from 'react-redux';
import { getCurrentFace, getVisibleFaceSrc, getVisibleFaceWidthHeight } from "../plugins/lotrlcg/functions/helpers";
import useProfile from "../../hooks/useProfile";
import { useCardSize } from "../../hooks/useCardSize";
import { useGameDefinition } from "./functions/useGameDefinition";

export const PileImage = React.memo(({
  groupType,
  defaultSideUp,
  stackIds,
  isDraggingOver,
  isDraggingFrom,
}) => {
  const user = useProfile();
  const gameDef = useGameDefinition();
  const playerN = useSelector(state => state?.playerUi?.playerN); // TODO: Implement player-specific conditions
  const stack0 = useSelector(state => state?.gameUi?.game?.stackById[stackIds[0]]);
  const stack1 = useSelector(state => state?.gameUi?.game?.stackById[stackIds[1]]);
  const card0 = useSelector(state => state?.gameUi?.game?.cardById[stack0?.cardIds[0]]);
  const card1 = useSelector(state => state?.gameUi?.game?.cardById[stack1?.cardIds[0]]);
  const cardSize = useCardSize();
  
  var visibleFaceSrc;
  var visibleFace;
  const groupSize = stackIds.length;
  if (groupType === "pile") {
    if (defaultSideUp === "B" && groupSize>0 && isDraggingOver && !isDraggingFrom) {
      visibleFace = getCurrentFace(card0)
    } else if (defaultSideUp === "B" && groupSize>1 && isDraggingFrom) {
      visibleFace = getCurrentFace(card1)
    } else if (defaultSideUp === "A" && groupSize>0 && isDraggingOver && !isDraggingFrom) {
      visibleFace = getCurrentFace(card0)
    } else if (defaultSideUp === "A" && groupSize>1 && isDraggingFrom) {
      visibleFace = getCurrentFace(card1)
    }      
    visibleFaceSrc = getVisibleFaceSrc(visibleFace, user, gameDef)
  }
  const cardWidthHeight = getVisibleFaceWidthHeight(visibleFace, gameDef);
  const cardWidth = cardWidthHeight.width;
  const cardHeight = cardWidthHeight.height;
  if (visibleFaceSrc?.src) {
    return (
        <div 
            style={{
                background: `url(${visibleFaceSrc.src}) no-repeat scroll 0% 0% / contain`,
                borderRadius: '0.6vh',
                borderColor: 'transparent',
                position: "absolute",
                width: `${cardSize*cardWidth}vh`,
                height: `${cardSize*cardHeight}vh`,
                left: `${0.2 + (1.39-cardWidth)*cardSize/2}vh`,
                top: "50%",
                transform: "translate(0%,-50%)",
            }}>   
        </div>)
  } else {
    return (<div/>);
  }
})
