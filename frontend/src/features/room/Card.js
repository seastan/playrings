import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { Tokens } from './Tokens';
import useProfile from "../../hooks/useProfile";
import { CardMouseRegion } from "./CardMouseRegion";
import { useSetActiveCard } from "../../contexts/ActiveCardContext";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCurrentFace, getVisibleFace, getVisibleFaceSrc, getDefault } from "./Helpers";
import { Target } from "./Target";
import { useTouchMode } from "../../contexts/TouchModeContext";

export const Card = React.memo(({
    cardId,
    groupId,
    groupType,
    gameBroadcast,
    chatBroadcast,
    playerN,
    cardIndex,
    cardSize,
    registerDivToArrowsContext
}) => {    
    const user = useProfile();
    const cardStore = state => state?.gameUi?.game?.cardById[cardId];
    const card = useSelector(cardStore);
    if (!card) return null;
    const currentFace = getCurrentFace(card);
    const visibleFace = getVisibleFace(card, playerN);
    const visibleFaceSrc = getVisibleFaceSrc(card, playerN, user);
    const zIndex = 1000 - cardIndex;
    console.log('Rendering Card ',visibleFace.name);
    const setActiveCard = useSetActiveCard();
    const [isActive, setIsActive] = useState(false);
    const touchMode = useTouchMode();
    const touchModeSpacingFactor = touchMode ? 1.5 : 1;
    const defaultAction = getDefault(card, groupId, groupType, cardIndex)

    const handleMouseLeave = (_event) => {
        setIsActive(false);
        setActiveCard(null);
    }

    return (
        <div id={card.id}>
            <div 
                className={isActive ? "shadow-yellow" : ""}
                key={card.id}
                style={{
                    position: "absolute",
                    //background: `url(${getVisibleFaceSRC(card, playerN, user)}) no-repeat scroll 0% 0% / contain`, //group.type === "deck" ? `url(${card.sides["B"].src}) no-repeat` : `url(${card.sides["A"].src}) no-repeat`,
                    height: `${cardSize*visibleFace.height}vh`,
                    width: `${cardSize*visibleFace.width}vh`,
                    left: `${0.2 + (1.39-visibleFace.width)*cardSize/2 + cardSize*touchModeSpacingFactor/3*cardIndex}vh`,
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
                <img className="absolute w-full h-full" style={{borderRadius: '0.6vh'}} src={visibleFaceSrc.src} onerror={`this.onerror=null; this.src=${visibleFaceSrc.default}`} />

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
                    cardSize={cardSize}
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
                    playerN={playerN}
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
                    playerN={playerN}
                />
                <Tokens
                    cardName={currentFace.name}
                    cardId={card.id}
                    isActive={isActive}
                    gameBroadcast={gameBroadcast}
                    chatBroadcast={chatBroadcast}
                    zIndex={zIndex}
                    aspectRatio={visibleFace.width/visibleFace.height}
                />
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
    const arrows1Store = state => state?.gameUi?.game?.playerData.player1.arrows;
    const arrows1 = useSelector(arrows1Store);
    const arrows2Store = state => state?.gameUi?.game?.playerData.player2.arrows;
    const arrows2 = useSelector(arrows2Store);
    const arrows3Store = state => state?.gameUi?.game?.playerData.player3.arrows;
    const arrows3 = useSelector(arrows3Store);
    const arrows4Store = state => state?.gameUi?.game?.playerData.player4.arrows;
    const arrows4 = useSelector(arrows4Store);
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