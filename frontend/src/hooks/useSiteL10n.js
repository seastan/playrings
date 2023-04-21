import { siteL10n } from "../features/definitions/localization";
import useProfile from "./useProfile";

export const useSiteL10n = () => {
    const user = useProfile();
    const language = user?.language || "English";
    return (labelId) => {
        return siteL10n?.[labelId]?.[language] || siteL10n?.[labelId]?.English || labelId;
    }
}