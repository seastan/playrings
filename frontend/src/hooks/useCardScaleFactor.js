import { useSelector } from "react-redux";
import { useLayout } from "../features/engine/functions/useLayout";

export const useCardScaleFactor = () => {
  const layout = useLayout();
  const cardSize = layout?.cardSize;
  const zoomFactor = useSelector(state => state?.playerUi?.zoomFactor);
  return cardSize*zoomFactor;
}