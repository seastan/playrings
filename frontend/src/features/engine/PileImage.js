/* The image shown for a pile of cards */

import React from "react";
import styled from "@emotion/styled";
import { useSelector } from 'react-redux';
import { getFirstCardOffset, getCurrentFace, getVisibleFaceSrc, getVisibleFaceWidthHeight } from "../plugins/lotrlcg/functions/helpers";
import useProfile from "../../hooks/useProfile";
import { useCardScaleFactor } from "../../hooks/useCardScaleFactor";
import { useGameDefinition } from "./functions/useGameDefinition";

const ImageElement = styled.div`
  background: url(${props => props.src}) no-repeat scroll 0% 0% / contain;
  borderRadius: 0.6vh;
  borderColor: transparent;
  position: absolute;
  width: ${props => props.width}vh;
  height: ${props => props.height}vh;
  left: ${props => props.leftOffset}vh;
  top: 50%;
  transform: translate(0%,-50%);
`;

export const PileImage = React.memo(({
  groupType,
  stackIds,
  isDraggingOver,
  isDraggingFrom,
}) => {
  const user = useProfile();
  const gameDef = useGameDefinition();
  const stack0 = useSelector(state => state?.gameUi?.game?.stackById[stackIds[0]]);
  const stack1 = useSelector(state => state?.gameUi?.game?.stackById[stackIds[1]]);
  const card0 = useSelector(state => state?.gameUi?.game?.cardById[stack0?.cardIds[0]]);
  const card1 = useSelector(state => state?.gameUi?.game?.cardById[stack1?.cardIds[0]]);
  const cardScaleFactor = useCardScaleFactor();
  
  var visibleFaceSrc;
  var visibleFace;
  const groupSize = stackIds.length;
  if (groupType === "pile") {
    if (groupSize>0 && isDraggingOver && !isDraggingFrom) {
      visibleFace = getCurrentFace(card0);
    } else if (groupSize>1 && isDraggingFrom) {
      visibleFace = getCurrentFace(card1);
    }      
    visibleFaceSrc = getVisibleFaceSrc(visibleFace, user, gameDef)
  }
  if (!visibleFace?.src) return null;

  const cardWidth = visibleFace?.width * cardScaleFactor;
  const cardHeight = visibleFace?.height * cardScaleFactor;
  const leftOffset = getFirstCardOffset(visibleFace?.width, cardScaleFactor);

  return( <ImageElement width={cardWidth} height={cardHeight} leftOffset={leftOffset} src={visibleFaceSrc.src}/> );
})