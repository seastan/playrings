import { useSelector } from "react-redux";
import { useGameDefinition } from "./useGameDefinition";

export const useLayout = () => {
    const gameDef = useGameDefinition();
    const layoutId = useSelector(state => state?.gameUi?.game?.layoutId);
    return gameDef?.layouts?.[layoutId];
}
