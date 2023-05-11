import { useSelector } from "react-redux";
import useProfile from "../../../hooks/useProfile";
import { useGameDefinition } from "./useGameDefinition";
import { usePlugin } from "./usePlugin";
import { useVisibleFace } from "./useVisibleFace";
import { useVisibleSide } from "./useVisibleSide";

export const useVisibleFaceSrc = (cardId) => {
    const user = useProfile();
    const plugin = usePlugin();
    const gameDef = useGameDefinition();
    const visibleSide = useVisibleSide(cardId);
    const visibleFace = useVisibleFace(cardId);
    const cardDbId = useSelector(state => state?.gameUi?.game?.cardById?.[cardId]?.cardDbId);

    if (!visibleFace) return null;

    var src = visibleFace.imageUrl;

    const altArt = user?.plugin_settings?.[plugin?.id]?.alt_art?.[cardDbId]?.[visibleSide];
    const altBack = user?.plugin_settings?.[plugin?.id]?.alt_art?.[visibleFace.name];
    const defaultArt = visibleFace.imageUrl;
    const defaultBack = gameDef?.cardBacks?.[visibleFace.name]?.imageUrl;
    if (visibleFace.name == "Fatty Bolger") {
        console.log("cardArt Fatty", {altArt, altBack, defaultArt, defaultBack})
        console.log("cardArt Fatty", user?.plugin_settings, 
            user,
            user?.plugin_settings,
            user?.plugin_settings?.[plugin?.id], 
            user?.plugin_settings?.[plugin?.id]?.alt_art, 
            user?.plugin_settings?.[plugin?.id]?.alt_art?.[cardDbId],
            user?.plugin_settings?.[plugin?.id]?.alt_art?.[cardDbId]?.[visibleSide])
    }

    var src = altArt || altBack || defaultArt || defaultBack; 

    const language = user?.language || "English";
    const srcLanguage = src.replace('/English/','/'+language+'/');
    
    return {
        src: srcLanguage,
        default: src
    }
}