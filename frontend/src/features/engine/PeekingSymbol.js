import { faEye } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react"
import { useSelector } from "react-redux";
import { usePlayerN } from "./hooks/usePlayerN";
import { useVisibleSide } from "./hooks/useVisibleSide";
import { useCardProp } from "./hooks/useCardProp";
import { useGroupProp } from "./hooks/useGroupProp";

export const PeekingSymbol = React.memo(({
    cardId,
}) => { 
    const cardCurrentSide = useSelector(state => state?.gameUi?.game?.cardById[cardId]?.currentSide);
    const cardVisibleSide = useVisibleSide(cardId);
    const playerN = usePlayerN();
    const groupId = useCardProp(cardId, "groupId");
    const defaultPeeking = useGroupProp(groupId, "onCardEnter")?.peeking?.[playerN];

    return (
        (cardCurrentSide === "B" && cardVisibleSide === "A" && !defaultPeeking) ? 
        <div className="absolute top-0 right-0 flex justify-center items-center bg-gray-300 opacity-60 rounded-lg p-1" style={{"width": "25px", "height": "25px"}}>
            <FontAwesomeIcon className="absolute text-lg" icon={faEye}/> 
        </div>
        : null
    )
})