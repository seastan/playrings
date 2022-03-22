import { gameL10n } from "../features/plugins/lotrlcg/definitions/localization";
import useProfile from "./useProfile";

export const useGameL10n = () => {
    const user = useProfile();
    const language = user?.language || "English";
    return (input) => {
        if (gameL10n[language] && Object.keys(gameL10n[language]).includes(input)) {
            return gameL10n[language][input];
        } else if (Object.keys(gameL10n["English"]).includes(input)) {
            return gameL10n["English"][input];
        } else {
            return input;
        }
    }
}