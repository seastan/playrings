import React from "react";
import { useSelector } from 'react-redux';
import { Token } from "./Token";
import { getCommittedStat, getCurrentFace, usesThreatToken } from "./Helpers";
import { useKeypress } from "../../contexts/KeypressContext";

export const CommittedToken = React.memo(({ 
    cardId,
    zIndex,
 }) => {
    const cardStore = state => state?.gameUi?.game?.cardById?.[cardId];
    const card = useSelector(cardStore);
    const questModeStore = state => state?.gameUi?.game?.questMode;
    const questMode = useSelector(questModeStore);
    const tokenType = getCommittedStat(questMode);
    const currentFace = getCurrentFace(card);
    const statVal = currentFace[tokenType];
    const tokenVal = card.tokens[tokenType];
    const totalVal = statVal + tokenVal;
    return(
        <div
            style={{
                position: "absolute",
                left: "0%",
                bottom: "50%",
                transform: `translate(-70%,+50%) rotate(-${card.rotation}deg)`,
                height: "2.6vh",}}>
            <div
                className="flex absolute text-white text-center w-full h-full items-center justify-center"
                style={{
                    textShadow: "rgb(0, 0, 0) 2px 0px 0px, rgb(0, 0, 0) 1.75517px 0.958851px 0px, rgb(0, 0, 0) 1.0806px 1.68294px 0px, rgb(0, 0, 0) 0.141474px 1.99499px 0px, rgb(0, 0, 0) -0.832294px 1.81859px 0px, rgb(0, 0, 0) -1.60229px 1.19694px 0px, rgb(0, 0, 0) -1.97999px 0.28224px 0px, rgb(0, 0, 0) -1.87291px -0.701566px 0px, rgb(0, 0, 0) -1.30729px -1.51361px 0px, rgb(0, 0, 0) -0.421592px -1.95506px 0px, rgb(0, 0, 0) 0.567324px -1.91785px 0px, rgb(0, 0, 0) 1.41734px -1.41108px 0px, rgb(0, 0, 0) 1.92034px -0.558831px 0px",
                }}>
                {totalVal}
            </div>
            <img 
                className="block h-full"
                src={process.env.PUBLIC_URL + '/images/tokens/'+tokenType+'.png'}/>
        </div>
    )
});