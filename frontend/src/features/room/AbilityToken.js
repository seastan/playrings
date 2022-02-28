import React from "react";
import { useSelector } from 'react-redux';
import { Token } from "./Token";
import { getCommittedStat, getCurrentFace, getVisibleSide, passesCriteria, usesThreatToken } from "./Helpers";
import { useKeypress } from "../../contexts/KeypressContext";
import abilities from "../../cardDB/abilities";

export const AbilityToken = React.memo(({ 
    card,
    groupId,
    groupType,
    cardIndex,
    playerN,
    zIndex,
 }) => {
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
    console.log("critcheck",cardExtended)
    console.log("critcheck",faceAbility.trigger)
    const matchesTrigger = passesCriteria(cardExtended, faceAbility.trigger);
    console.log("critcheck",matchesTrigger)
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