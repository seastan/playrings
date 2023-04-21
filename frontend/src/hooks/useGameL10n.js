import { useGameDefinition } from "../features/engine/functions/useGameDefinition";
import useProfile from "./useProfile";

export const useGameL10n = () => {
    const user = useProfile();
    const gameDef = useGameDefinition();
    const language = user?.language || "English";
    return (labelId) => {
        return gameDef?.labels?.[labelId]?.[language] || gameDef?.labels?.[labelId]?.English || labelId;
    }
}