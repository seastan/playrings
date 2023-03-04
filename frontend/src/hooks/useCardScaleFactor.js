import { useSelector } from "react-redux";

export const useCardScaleFactor = () => {
  const cardSize = useSelector(state => state?.gameUi?.game?.layout?.cardSize);
  const cardSizeFactor = useSelector(state => state?.playerUi?.cardSizeFactor);
  return cardSize*cardSizeFactor;
}