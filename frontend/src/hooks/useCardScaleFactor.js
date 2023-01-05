import { useSelector } from "react-redux";
import useWindowDimensions from "./useWindowDimensions";

export const useCardScaleFactor = () => {
  const layout = useSelector(state => state?.gameUi?.game?.layout);
  var cardSize = useSelector(state => state?.playerUi?.cardSize);
  const cardSizeFactor = useSelector(state => state?.playerUi?.cardSizeFactor);
  const { height, width } = useWindowDimensions();
  const aspectRatio = width/height;
  const numRows = layout.length;
  var cardSize = 52/numRows;
  if (aspectRatio < 1.9) cardSize = cardSize*(1-0.75*(1.9-aspectRatio));
  return cardSize*cardSizeFactor;
}