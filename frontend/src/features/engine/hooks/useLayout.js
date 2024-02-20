import { useSelector } from "react-redux";
import { usePlayerN } from "./usePlayerN";

export const useLayout = () => {
    const playerN = usePlayerN();
    return useSelector(state => (playerN ? state?.gameUi?.game?.playerData?.[playerN]?.layout : state?.gameUi?.game?.layout));
}
