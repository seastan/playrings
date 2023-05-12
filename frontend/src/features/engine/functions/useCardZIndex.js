import { useSelector } from "react-redux"
import { DEFAULT_CARD_Z_INDEX } from "../../definitions/common";

export const useCardZIndex = (cardId) => {
    return DEFAULT_CARD_Z_INDEX - useSelector(state => state?.gameUi?.game?.cardById[cardId]?.cardIndex);
}