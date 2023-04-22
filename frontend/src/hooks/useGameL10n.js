import { siteL10n } from "../features/definitions/localization";
import { useGameDefinition } from "../features/engine/functions/useGameDefinition";
import useProfile from "./useProfile";

export const useGameL10n = () => {
    const user = useProfile();
    const gameDef = useGameDefinition();
    const language = user?.language || "English";
    return (labelId) => {
        return gameDef?.labels?.[labelId]?.[language] || 
            gameDef?.labels?.[labelId]?.English || 
            siteL10n?.[labelId]?.[language] || 
            siteL10n?.[labelId]?.English || 
            labelId;
    }
}