import React from "react";
import { useSelector } from "react-redux";
import { useGameL10n } from "./hooks/useGameL10n";
import { useGetDefaultAction } from "./hooks/useGetDefaultAction";

export const DefaultActionLabel = React.memo(({
    cardId,
}) => { 
    const l10n = useGameL10n();
    const touchMode = useSelector(state => state?.playerUi?.touchMode);
    const isActive = useSelector(state => {return state?.playerUi?.activeCardId === cardId});
    const getDefaultAction = useGetDefaultAction();
    const defaultAction = touchMode && isActive ? getDefaultAction(cardId) : null;

    if (!defaultAction) return null;

    else return (
        <div 
            className={"absolute w-full pointer-events-none bg-green-700 font-bold rounded text-white text-xs text-center" + (defaultAction.position === "bottom" ? " bottom-0" : "")}
            style={{height:"40px", opacity: "80%"}}>
                <div>Tap to</div>
                {l10n(defaultAction.label)}
        </div>
    )
})