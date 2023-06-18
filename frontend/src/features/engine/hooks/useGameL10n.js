import { useGameDefinition } from "./useGameDefinition";
import useProfile from "../../../hooks/useProfile";

export const useGameL10n = () => {
    const user = useProfile();
    const gameDef = useGameDefinition();
    const language = user?.language || "English";
    return (label) => {
        if (!label) return "";
        else if (typeof label !== "string") return "";
        else if (label.startsWith("id:")) {
            const labelId = label.substring(3);
            return gameDef?.labels?.[labelId]?.[language] || gameDef?.labels?.[labelId]?.English;
        }
        else return label;
    }
}