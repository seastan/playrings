import { useSelector } from "react-redux";

export const useCardScaleFactor = () => {
  const cardSize = useSelector(state => state?.gameUi?.game?.layout?.cardSize);
  const zoomFactor = useSelector(state => state?.playerUi?.zoomFactor);
  return cardSize*zoomFactor;
}