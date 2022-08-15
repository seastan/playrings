import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Tokens } from './Tokens';
import { CommittedToken } from './CommittedToken';
import useProfile from "../../hooks/useProfile";
import { CardMouseRegion } from "./CardMouseRegion";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCurrentFace, getVisibleFace, getVisibleFaceSrc, getDefault, usesThreatToken } from "../plugins/lotrlcg/functions/helpers";
import { Target } from "./Target";
import { AbilityToken } from "./AbilityToken";
import { setActiveCardObj } from "../store/playerUiSlice";
import { useCardSize } from "../../hooks/useCardSize";
import { useGameDefinition } from "./functions/useGameDefinition";

function useTraceUpdate(props) {
    const prev = useRef(props);
    useEffect(() => {
        const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
        if (prev.current[k] !== v) {
            ps[k] = [prev.current[k], v];
        }
        return ps;
        }, {});
        if (Object.keys(changedProps).length > 0) {
        console.log('Changed props:', changedProps);
        }
        prev.current = props;
    });
}

export const Card = React.memo(({
    cardId,
    groupId,
    groupType,
    offset,
    cardIndex,
    registerDivToArrowsContext,
    isDragging,
}) => {    
    // useTraceUpdate({
    //     cardId,
    //     groupId,
    //     groupType,
    //     offset,
    //     chatBroadcast,
    //     cardIndex,
    //     registerDivToArrowsContext
    // });
    const dispatch = useDispatch();
    const user = useProfile();
    const gameDef = useGameDefinition();
    //const card = useSelector(state => state?.gameUi?.game?.cardById[cardId]);
    const cardCurrentSide = useSelector(state => state?.gameUi?.game?.cardById[cardId]?.currentSide);
    const cardSides = useSelector(state => state?.gameUi?.game?.cardById[cardId]?.sides);
    const cardPeeking = useSelector(state => state?.gameUi?.game?.cardById[cardId]?.peeking);
    const cardTokens = useSelector(state => state?.gameUi?.game?.cardById[cardId]?.tokens);
    const cardRotation = useSelector(state => state?.gameUi?.game?.cardById[cardId]?.rotation);
    const cardCommitted = useSelector(state => state?.gameUi?.game?.cardById[cardId]?.committed);
    const playerN = useSelector(state => state?.playerUi?.playerN);
    const cardSize = useCardSize();
    const touchMode = useSelector(state => state?.playerUi?.touchMode);
    if (!cardCurrentSide) return;
    var cardVisibleSide = cardCurrentSide;
    if (cardPeeking[playerN] && cardCurrentSide == "A") cardVisibleSide = "B";
    else if (cardPeeking[playerN] && cardCurrentSide == "B") cardVisibleSide = "A";
    const currentFace = cardSides[cardCurrentSide];
    const cardVisibleFace = cardSides[cardVisibleSide];
    const visibleFaceSrc = getVisibleFaceSrc(cardVisibleFace, playerN, gameDef);
    const zIndex = 1000 - cardIndex;
    console.log('Rendering Card ',cardVisibleFace.name);
    const isActive = useSelector(state => {return state?.playerUi?.activeCardObj?.card?.id === cardId});
    const touchModeSpacingFactor = touchMode ? 1.5 : 1;
    const defaultAction = null; //FIXME getDefault(card, groupId, groupType, cardIndex)

    const handleMouseLeave = (_event) => {
        //setIsActive(false);
        dispatch(setActiveCardObj(null));
    }

    var [height, width] = [cardVisibleFace.height, cardVisibleFace.width];
    if (!height || !width) {
        height = gameDef?.cardBacks?.[cardVisibleFace.name]?.height;
        width = gameDef?.cardBacks?.[cardVisibleFace.name]?.width;
    }
    // FIXME: display error if height and width still not defined?

    const horizontalOffset = 0.2 + (1.39-width)*cardSize/2 + cardSize*touchModeSpacingFactor/3*offset;
    const destroyed = currentFace.hitPoints > 0 && cardTokens.damage >= currentFace.hitPoints + cardTokens.hitPoints;
    const explored = currentFace.questPoints > 0 && cardTokens.progress >= currentFace.questPoints + cardTokens.hitPoints;


    var className = "";
    if (isActive) className = "shadow-yellow"
    if (destroyed) className = "shadow-red";
    if (explored) className = "shadow-green";
    return (
        <div id={cardId}>
            <div 
                className={className}
                key={cardId}
                style={{
                    position: "absolute",
                    height: `${cardSize*height}vh`,
                    width: `${cardSize*width}vh`,
                    left: `${horizontalOffset}vh`,
                    top: "50%",
                    borderRadius: '0.6vh',
                    transform: `translate(0%, ${groupType === "vertical" ? "0%" : "-50%"}) rotate(${cardRotation}deg)`,
                    zIndex: zIndex,
                    cursor: "default",
                    WebkitTransitionDuration: "0.1s",
                    MozTransitionDuration: "0.1s",
                    OTransitionDuration: "0.1s",
                    transitionDuration: "0.1s",
                    WebkitTransitionProperty: "-webkit-transform",
                    MozTransitionProperty: "-moz-transform",
                    OTransitionProperty: "-o-transform",
                    transitionProperty: "transform",
                    MozBoxShadow: isDragging ? '10px 10px 30px 20px rgba(0, 0, 0, 0.3)' : null,
                    WebkitBoxShadow: isDragging ? '10px 10px 30px 20px rgba(0, 0, 0, 0.3)': null,
                    boxShadow: isDragging ? '10px 10px 30px 20px rgba(0, 0, 0, 0.3)': null,
                }}
                onMouseLeave={event => handleMouseLeave(event)}>
                <img className="absolute w-full h-full" style={{borderRadius: '0.6vh'}} src={visibleFaceSrc.src} onError={(e)=>{e.target.onerror = null; e.target.src=visibleFaceSrc.default}} />

                {isActive && touchMode && defaultAction &&
                    <div 
                        className={"absolute w-full pointer-events-none bg-green-700 font-bold rounded text-white text-xs text-center" + (cardRotation === -30 ? " bottom-0" : "")}
                        style={{height:"40px", opacity: "80%"}}>
                            <div>Tap to</div>
                            {defaultAction.title}
                    </div>}
                {(cardPeeking[playerN] && groupType !== "hand" && (cardCurrentSide === "B")) ? <FontAwesomeIcon className="absolute top-0 right-0 text-2xl" icon={faEye}/>:null}
                <Target
                    cardId={cardId}
                />
                <CardMouseRegion 
                    position={"top"}
                    top={"0%"}
                    cardId={cardId}
                    isActive={isActive}
                    //setIsActive={setIsActive}
                    zIndex={zIndex}
                    cardIndex={cardIndex}
                    groupId={groupId}
                    groupType={groupType}
                />
                <CardMouseRegion 
                    position={"bottom"}
                    top={"50%"}
                    cardId={cardId}
                    isActive={isActive}
                    //setIsActive={setIsActive}
                    zIndex={zIndex}
                    cardIndex={cardIndex}
                    groupId={groupId}
                    groupType={groupType}
                />
                <Tokens
                    cardName={currentFace.name}
                    cardId={cardId}
                    cardType={cardVisibleFace.type}
                    isActive={isActive}
                    zIndex={zIndex}
                    aspectRatio={width/height}
                />
                {cardCommitted && <CommittedToken
                    cardId={cardId}
                    zIndex={zIndex}
                />}
                {isActive && <AbilityToken
                    cardId={cardId}
                    groupId={groupId}
                    groupType={groupType}
                    cardIndex={cardIndex}
                    zIndex={zIndex}
                />}
                <ArrowRegion
                    cardId={cardId}
                    registerDivToArrowsContext={registerDivToArrowsContext}
                />
            </div>
        </div>
    )
})

const ArrowRegion = React.memo(({
    cardId,
    registerDivToArrowsContext
}) => {  
    const arrows1 = useSelector(state => state?.gameUi?.game?.playerData.player1.arrows);
    const arrows2 = useSelector(state => state?.gameUi?.game?.playerData.player2.arrows);
    const arrows3 = useSelector(state => state?.gameUi?.game?.playerData.player3.arrows);
    const arrows4 = useSelector(state => state?.gameUi?.game?.playerData.player4.arrows);
    const allIds = [arrows1, arrows2, arrows3, arrows4].flat(3);
    if (!allIds.includes(cardId)) return null;
    return (
        <div 
            ref={registerDivToArrowsContext? (div) => registerDivToArrowsContext({ id: "arrow-"+cardId, div }) : null} 
            style={{
                position: "absolute",
                width: "1px", 
                height: "1px",
                top: "50%",
                left: "50%",
            }}/>
    )
})