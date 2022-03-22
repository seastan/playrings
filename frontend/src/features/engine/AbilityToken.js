import React from "react";
import { useSelector } from 'react-redux';
import { getVisibleSide, passesCriteria } from "../plugins/lotrlcg/functions/helpers";
import abilities from "../plugins/lotrlcg/definitions/abilities";

export const AbilityToken = React.memo(({ 
    card,
    groupId,
    groupType,
    cardIndex,
    zIndex,
 }) => {
    const playerN = useSelector(state => state?.playerUi?.playerN)
    const cardAbilities = abilities[card.cardDbId];
    if (!cardAbilities) return; // Card is not in ability database
    const visibleSide = getVisibleSide(card, playerN);
    const faceAbilities = cardAbilities[visibleSide];
    if (!faceAbilities) return; // Card face does not have abilities
    if (faceAbilities.length !== 1) return; // Card face does not have 1 ability
    const faceAbility = faceAbilities[0];
    const cardExtended = {...card,
        groupId: groupId,
        groupType: groupType,
        cardIndex: cardIndex
    }
    const matchesTrigger = passesCriteria(cardExtended, faceAbility.trigger);
    if (!matchesTrigger) return; // Card does not meet trigger condition

    return(
        <div
            style={{
                position: "absolute",
                right: "0%",
                top: "0%",
                transform: "translate(50%,-50%)",
                height: "2.5vh",}}>
            <img 
                className="block h-full"
                src={process.env.PUBLIC_URL + '/images/tokens/abilityToken.png'}
                title={`Press Shift+A to trigger this card's ability`}/>
        </div>
    )
});