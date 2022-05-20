import { siteL10n } from "../features/definitions/localization";
import useProfile from "./useProfile";

export const useSiteL10n = () => {
    const user = useProfile();
    const language = user?.language || "English";
    return (input) => {
        if (siteL10n[language] && Object.keys(siteL10n[language]).includes(input)) {
            return siteL10n[language][input];
        } else if (Object.keys(siteL10n["English"]).includes(input)) {
            return siteL10n["English"][input];
        } else {
            return input;
        }
    }
}