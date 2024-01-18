import React from "react";
import { useSelector } from "react-redux";
import { useVisibleFace } from "./hooks/useVisibleFace";
import { keysDiv } from "./functions/common";
import { useCardZIndex } from "./hooks/useCardZIndex";
import { useDoActionList } from "./hooks/useDoActionList";
import { dragnActionLists } from "./functions/dragnActionLists";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { usePlayerN } from "./hooks/usePlayerN";

export const AbilityButton = React.memo(({
    cardId,
}) => { 
    const playerN = usePlayerN();
    const cardVisibleFace = useVisibleFace(cardId);
    const zIndex = useCardZIndex(cardId);
    const isActive = useSelector(state => {return state?.playerUi?.activeCardId === cardId});
    const ability = cardVisibleFace?.ability;
    const hasAbility = cardVisibleFace?.ability !== undefined && cardVisibleFace?.ability !== null;
    const doActionList = useDoActionList();


    const handleAbilityClick = () => {
        doActionList(dragnActionLists.triggerAutomationAbility(ability))
    }

    if (!playerN) return null;

    if (isActive && hasAbility) {
        return (
            <div>
                <div 
                    className="absolute flex rounded-3xl bg-gray-600 border hover:bg-red-700 text-gray-300 justify-center items-center"
                    style={{
                        width: "3.5vh",
                        height: "3.5vh",
                        fontSize: "2vh",
                        top: "0%",
                        right: "0%",
                        zIndex:zIndex+1,
                        transform: "translate(30%, 0%)"
                    }}
                    onClick={() => handleAbilityClick()}
                >
                    <div><FontAwesomeIcon icon={faBolt}/></div>
                </div>
            </div>
        )
    }
    return null;
})

// style={{
//     top: "50%",
//     right: "0%",
//     zIndex:zIndex+1, 
//     writingMode: "vertical-rl",
//     transform: "translate(0%, -50%)"
// }}