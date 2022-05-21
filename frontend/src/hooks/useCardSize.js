import React from "react";
import { useSelector } from "react-redux";
import useWindowDimensions from "./useWindowDimensions";
import { CARDSCALE, LAYOUTINFO } from "../features/plugins/lotrlcg/definitions/constants";
import { useGameDefinition } from "../features/engine/functions/useGameDefinition";

export const useCardSize = () => {
  const layout = useSelector(state => state?.gameUi?.game?.layout);
  var cardSize = useSelector(state => state?.playerUi?.cardSize);
  const cardSizeFactor = useSelector(state => state?.playerUi?.cardSizeFactor);
  const { height, width } = useWindowDimensions();
  const aspectRatio = width/height;
  const numRows = layout.length;
  var cardSize = CARDSCALE/numRows;
  if (aspectRatio < 1.9) cardSize = cardSize*(1-0.75*(1.9-aspectRatio));
  return cardSize*cardSizeFactor;
}