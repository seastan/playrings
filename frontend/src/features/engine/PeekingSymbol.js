import { faEye } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react"
import { useSelector } from "react-redux";
import { usePlayerN } from "./functions/usePlayerN";
import { useVisibleSide } from "./functions/useVisibleSide";
import { useCardProp } from "./functions/useCardProp";
import { useGroupProp } from "./functions/useGroupProp";

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
        <FontAwesomeIcon className="absolute top-0 right-0 text-2xl" icon={faEye}/> : null
    )
})