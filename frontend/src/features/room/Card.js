import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Tokens } from './Tokens';
import { CommittedToken } from './CommittedToken';
import useProfile from "../../hooks/useProfile";
import { CardMouseRegion } from "./CardMouseRegion";
import { useSetActiveCard } from "../../contexts/ActiveCardContext";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCurrentFace, getVisibleFace, getVisibleFaceSrc, getDefault, usesThreatToken } from "./Helpers";
import { Target } from "./Target";
import { useTouchMode } from "../../contexts/TouchModeContext";
import { AbilityToken } from "./AbilityToken";
import { setActiveCardObj } from "./playerUiSlice";

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
    gameBroadcast,
    chatBroadcast,
    cardIndex,
    registerDivToArrowsContext
}) => {    
    // useTraceUpdate({
    //     cardId,
    //     groupId,
    //     groupType,
    //     offset,
    //     gameBroadcast,
    //     chatBroadcast,
    //     cardIndex,
    //     registerDivToArrowsContext
    // });
    const dispatch = useDispatch();
    const user = useProfile();
    const card = useSelector(state => state?.gameUi?.game?.cardById[cardId]);
    const playerN = useSelector(state => state?.playerUi?.playerN);
    const cardSize = useSelector(state => state?.playerUi?.cardSize);
    console.log("CardSize ", cardSize);
    if (!card) return;
    const currentFace = getCurrentFace(card);
    const visibleFace = getVisibleFace(card, playerN);
    const visibleFaceSrc = getVisibleFaceSrc(card, playerN, user);
    const zIndex = 1000 - cardIndex;
    console.log('Rendering Card ',visibleFace.name);
    const [isActive, setIsActive] = useState(false);
    const touchMode = useTouchMode();
    const touchModeSpacingFactor = touchMode ? 1.5 : 1;
    const defaultAction = getDefault(card, groupId, groupType, cardIndex)

    const handleMouseLeave = (_event) => {
        setIsActive(false);
        dispatch(setActiveCardObj(null));
    }

    const horizontalOffset = 0.2 + (1.39-visibleFace.width)*cardSize/2 + cardSize*touchModeSpacingFactor/3*offset;
    const destroyed = currentFace.hitPoints > 0 && card.tokens.damage >= currentFace.hitPoints + card.tokens.hitPoints;
    const explored = currentFace.questPoints > 0 && card.tokens.progress >= currentFace.questPoints + card.tokens.hitPoints;

    var className = "";
    if (isActive) className = "shadow-yellow"
    if (destroyed) className = "shadow-red";
    if (explored) className = "shadow-green";
    return (
        <div id={card.id}>
            <div 
                className={className}
                key={card.id}
                style={{
                    position: "absolute",
                    //background: `url(${getVisibleFaceSRC(card, playerN, user)}) no-repeat scroll 0% 0% / contain`, //group.type === "deck" ? `url(${card.sides["B"].src}) no-repeat` : `url(${card.sides["A"].src}) no-repeat`,
                    height: `${cardSize*visibleFace.height}vh`,
                    width: `${cardSize*visibleFace.width}vh`,
                    left: `${horizontalOffset}vh`,
                    top: "50%",
                    borderRadius: '0.6vh',
                    transform: `translate(0%, ${groupType === "vertical" ? "0%" : "-50%"}) rotate(${card.rotation}deg)`,
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
                }}
                onMouseLeave={event => handleMouseLeave(event)}>
                <img className="absolute w-full h-full" style={{borderRadius: '0.6vh'}} src={visibleFaceSrc.src} onError={(e)=>{e.target.onerror = null; e.target.src=visibleFaceSrc.default}} />

                {/* {destroyed &&
                    <div className="absolute w-full h-full bg-red-700" style={{opacity: 0.3}}/>
                }                
                {explored &&
                    <div className="absolute w-full h-full bg-green-700" style={{opacity: 0.3}}/>
                } */}
                {isActive && touchMode && defaultAction &&
                    <div 
                        className={"absolute w-full pointer-events-none bg-green-700 font-bold rounded text-white text-xs text-center" + (card.rotation === -30 ? " bottom-0" : "")}
                        style={{height:"40px", opacity: "80%"}}>
                            <div>Tap to</div>
                            {defaultAction.title}
                    </div>}
                {(card["peeking"][playerN] && groupType !== "hand" && (card["currentSide"] === "B")) ? <FontAwesomeIcon className="absolute top-0 right-0 text-2xl" icon={faEye}/>:null}
                <Target
                    cardId={cardId}
                />
                <CardMouseRegion 
                    position={"top"}
                    top={"0%"}
                    card={card}
                    isActive={isActive}
                    setIsActive={setIsActive}
                    zIndex={zIndex}
                    cardIndex={cardIndex}
                    groupId={groupId}
                    groupType={groupType}
                />
                <CardMouseRegion 
                    position={"bottom"}
                    top={"50%"}
                    card={card}
                    isActive={isActive}
                    setIsActive={setIsActive}
                    zIndex={zIndex}
                    cardIndex={cardIndex}
                    groupId={groupId}
                    groupType={groupType}
                />
                <Tokens
                    cardName={currentFace.name}
                    cardId={card.id}
                    usesThreatToken={usesThreatToken(card)}
                    isActive={isActive}
                    gameBroadcast={gameBroadcast}
                    chatBroadcast={chatBroadcast}
                    zIndex={zIndex}
                    aspectRatio={visibleFace.width/visibleFace.height}
                />
                {card.committed && <CommittedToken
                    cardId={card.id}
                    zIndex={zIndex}
                />}
                {isActive && <AbilityToken
                    card={card}
                    groupId={groupId}
                    groupType={groupType}
                    cardIndex={cardIndex}
                    zIndex={zIndex}
                />}
                <ArrowRegion
                    cardId={card.id}
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