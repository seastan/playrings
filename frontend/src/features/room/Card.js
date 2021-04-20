import React, { useState, useEffect, useRef, Component } from "react";
import { ArcherElement } from 'react-archer';
import { useSelector, useDispatch } from 'react-redux';
import { Tokens } from './Tokens';
import { playerBackSRC, encounterBackSRC } from "./Constants";
import { getCardFaceSRC } from "./CardBack";
import { GROUPSINFO } from "./Constants";
import styled from "@emotion/styled";
import { ContextMenu, MenuItem, SubMenu, ContextMenuTrigger } from "react-contextmenu";
import { CardMouseRegion } from "./CardMouseRegion"
import { useActiveCard, useSetActiveCard } from "../../contexts/ActiveCardContext";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getDisplayName, getCurrentFace, getVisibleFace, getVisibleFaceSRC, getVisibleSide } from "./Helpers";
import { setGame } from "./gameUiSlice";
import { Target } from "./Target";

// PREVENT DOUBLECLICK REGISTERING 2 CLICK EVENTS
export const delay = n => new Promise(resolve => setTimeout(resolve, n));

export const cancellablePromise = promise => {
    let isCanceled = false;
  
    const wrappedPromise = new Promise((resolve, reject) => {
      promise.then(
        value => (isCanceled ? reject({ isCanceled, value }) : resolve(value)),
        error => reject({ isCanceled, error }),
      );
    });
  
    return {
      promise: wrappedPromise,
      cancel: () => (isCanceled = true),
    };
};

const useCancellablePromises = () => {
  const pendingPromises = useRef([]);

  const appendPendingPromise = promise =>
    pendingPromises.current = [...pendingPromises.current, promise];

  const removePendingPromise = promise =>
    pendingPromises.current = pendingPromises.current.filter(p => p !== promise);

  const clearPendingPromises = () => pendingPromises.current.map(p => p.cancel());

  const api = {
    appendPendingPromise,
    removePendingPromise,
    clearPendingPromises,
  };

  return api;
};

const useClickPreventionOnDoubleClick = (onClick, onDoubleClick) => {
    const api = useCancellablePromises();
  
    const handleClick = () => {
      api.clearPendingPromises();
      const waitForClick = cancellablePromise(delay(300));
      api.appendPendingPromise(waitForClick);
  
      return waitForClick.promise
        .then(() => {
          api.removePendingPromise(waitForClick);
          onClick();
        })
        .catch(errorInfo => {
          api.removePendingPromise(waitForClick);
          if (!errorInfo.isCanceled) {
            throw errorInfo.error;
          }
        });
    };
  
    const handleDoubleClick = () => {
      api.clearPendingPromises();
      onDoubleClick();
    };
  
    return [handleClick, handleDoubleClick];
};
// END PREVENT DOUBLECLICK REGISTERING 2 CLICK EVENTS



    // const storeCard = state => state.game.cardById[inputCard.id];
    // const dispatch = useDispatch();
    // const hello = useSelector(storeCard);

export const Card = React.memo(({
    cardId,
    gameBroadcast,
    chatBroadcast,
    groupType,
    playerN,
    cardIndex,
    cardSize,
}) => {
    console.log(cardId)
    console.log(groupType)
    console.log(playerN)
    console.log(cardIndex)
    console.log(cardSize)
    const cardStore = state => state?.gameUi?.game?.cardById[cardId];
    const card = useSelector(cardStore);
    if (!card) return null;
    const currentFace = getCurrentFace(card);
    const visibleSide = getVisibleSide(card, playerN);
    const visibleFace = getVisibleFace(card, playerN);
    const zIndex = 1000 - cardIndex;
    console.log('rendering card ',visibleFace.name);

    // return (
    //     <div 
    //         key={card.id}
    //         style={{
    //             position: "absolute",
    //             backgroundColor: `red`, //group.type === "deck" ? `url(${card.sides["B"].src}) no-repeat` : `url(${card.sides["A"].src}) no-repeat`,
    //             height: `${cardSize*visibleFace.height}vw`,
    //             width: `${cardSize*visibleFace.width}vw`,
    //             left: `${0.2 + (1.39-visibleFace.width)*cardSize/2 + cardSize/3*cardIndex}vw`,
    //         }}
    //     />
    // )
    // useEffect(() => {    
    //     if (JSON.stringify(inputCard) !== JSON.stringify(card)) setCard(inputCard);
    // }, [inputCard]);

    //const [, updateState] = React.useState();
    //const forceUpdate = React.useCallback(() => updateState({}), []);
    const setActiveCard = useSetActiveCard();

    const [isActive, setIsActive] = useState(false);
    const displayName = getDisplayName(card);
    //const groups = gameUIView.game_ui.game.groups;
    //const cardWatch = groups[group.id].stacks[stackIndex]?.cards[cardIndex];

    //if (groupId==='sharedStaging') console.log('rendering CardComponent');
    //if (groupId==='sharedStaging') console.log(card);

    // useEffect(() => {    
    //   if (card) setCard(card);
    // }, [card]);
    //console.log('rendering',group.id,stackIndex,cardIndex, "comp");

    const onClick = (event) => {
        console.log(card);
        console.log(playerN);
        console.log(card.peeking[playerN]);
        //forceUpdate();
        return;
    }

    const handleMouseLeave = (event) => {
        setIsActive(false);
        setActiveCard(null);
    }

    const arrowRelationList = () => {
        const relationList = [];
        for (var id of card.arrowIds) {
            const relation = {
                targetId: 'arrow-'+id,
                targetAnchor: 'top',
                sourceAnchor: 'bottom',
            }
            relationList.push(relation);
        }
        return relationList;
    }

    const handleMenuClick = (e, data) => {
        if (data.action === "detach") {
            gameBroadcast("game_action", {action: "detach", options: {card_id: card.id}})
            chatBroadcast("game_update", {message: "detached "+displayName+"."})
        } else if (data.action === "peek") {
            gameBroadcast("game_action", {action: "peek_card", options: {card_id: card.id, value: true}})
            chatBroadcast("game_update", {message: "peeked at "+displayName+"."})
        } else if (data.action === "unpeek") {
            gameBroadcast("game_action", {action: "peek_card", options: {card_id: card.id, value: false}})
            chatBroadcast("game_update", {message: " stopped peeking at "+displayName+"."})
        } else if (data.action === "move_card") {
            const destGroupTitle = GROUPSINFO[data.destGroupId].name;
            if (data.position === "t") {
                gameBroadcast("game_action", {action: "move_card", options: {card_id: card.id, dest_group_id: data.destGroupId, dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}})
                chatBroadcast("game_update",{message: "moved "+displayName+" to top of "+destGroupTitle+"."})
            } else if (data.position === "b") {
                gameBroadcast("game_action", {action: "move_card", options: {card_id: card.id, dest_group_id: data.destGroupId, dest_stack_index: -1, dest_card_index: 0, combine: false, preserve_state: false}})
                chatBroadcast("game_update",{message: "moved "+displayName+" to bottom of "+destGroupTitle+"."})
            } else if (data.position === "s") {
                gameBroadcast("game_action", {action: "move_card", options: {card_id: card.id, dest_group_id: data.destGroupId, dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}})
                gameBroadcast("shuffle_group", {group_id: data.destGroupId})
                chatBroadcast("game_update",{message: "shuffled "+displayName+" into "+destGroupTitle+"."})
            }
        } else if (data.action === "update_tokens_per_round") {
            const increment = data.increment;
            const tokenType = data.tokenType;
            gameBroadcast("game_action", {action: "update_values", options: {updates: [["game", "cardById", card.id, "tokensPerRound", tokenType, increment]]}})
            chatBroadcast("game_update",{message: "added "+increment+" "+tokenType+" per round to "+displayName+"."})
        }
    }
    
    //console.log('rendering card ',visibleFace.name);

    return (
        <div>

            <ContextMenuTrigger id={card.id} holdToDisplay={500}> 
            {/* <div className="flex h-full items-center"> */}
                <div 
                    className={isActive ? 'isActive' : ''}
                    key={card.id}
                    style={{
                        position: "absolute",
                        background: `url(${getVisibleFaceSRC(card,playerN)}) no-repeat scroll 0% 0% / contain`, //group.type === "deck" ? `url(${card.sides["B"].src}) no-repeat` : `url(${card.sides["A"].src}) no-repeat`,
                        height: `${cardSize*visibleFace.height}vw`,
                        width: `${cardSize*visibleFace.width}vw`,
                        left: `${0.2 + (1.39-visibleFace.width)*cardSize/2 + cardSize/3*cardIndex}vw`,
                        top: "50%", //`${0.2 + (1.39-visibleFace.height)*cardSize/2}vw`,
                        borderRadius: '6px',
                        MozBoxShadow: isActive ? '0 0 7px yellow' : '',
                        WebkitBoxShadow: isActive ? '0 0 7px yellow' : '',
                        boxShadow: isActive ? '0 0 7px yellow' : '',
                        transform: `translate(0%,-50%) rotate(${card.rotation}deg)`,
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
                    onClick={onClick}
                    //onDoubleClick={handleDoubleClick}
                    onMouseLeave={event => handleMouseLeave(event)}
                >
                    {(card["peeking"][playerN] && !(groupType == "hand") && (card["currentSide"] === "B")) ? <FontAwesomeIcon className="absolute bottom-0 text-2xl" icon={faEye}/>:null}
                    
                    <Target
                        cardId={cardId}
                        cardSize={cardSize}
                    />

                    <Tokens
                        cardName={currentFace.name}
                        cardType={currentFace.type}
                        cardId={card.id}
                        isActive={isActive}
                        gameBroadcast={gameBroadcast}
                        chatBroadcast={chatBroadcast}
                        zIndex={zIndex}
                    />

                    <CardMouseRegion 
                        position={"top"}
                        top={"0%"}
                        card={card}
                        setIsActive={setIsActive}
                        zIndex={zIndex}
                    />
                    
                    <CardMouseRegion 
                        position={"bottom"}
                        top={"50%"}
                        card={card}
                        setIsActive={setIsActive}
                        zIndex={zIndex}
                    />

                    <ArcherElement
                        id={"arrow-"+card.id}
                        relations={arrowRelationList()}
                    >
                        <div style={{
                            position: "absolute",
                            width: "15px", 
                            height: "15px",
                            backgroundColor: "red",
                            top: "70%",
                            left: "50%",
                        }}/>
                    </ArcherElement>
                </div>
            {/* </div> */}
            </ContextMenuTrigger>

             <ContextMenu id={card.id} style={{zIndex:1e8}}>
                 <hr></hr>
                 {cardIndex>0 ? <MenuItem onClick={handleMenuClick} data={{action: 'detach'}}>Detach</MenuItem>:null}
                 {visibleSide == "B"? <MenuItem onClick={handleMenuClick} data={{action: 'peek'}}>Peek</MenuItem>:null}
                 {card["peeking"][playerN] ? <MenuItem onClick={handleMenuClick} data={{action: 'unpeek'}}>Stop peeking</MenuItem>:null}
                 <SubMenu title='Move to'>
                     <SubMenu title='Encounter Deck'>
                         <MenuItem onClick={handleMenuClick} data={{action: 'move_card', destGroupId: "sharedEncounterDeck", position: "t"}}>Top</MenuItem>
                         <MenuItem onClick={handleMenuClick} data={{action: 'move_card', destGroupId: "sharedEncounterDeck", position: "b"}}>Bottom</MenuItem>
                         <MenuItem onClick={handleMenuClick} data={{action: 'move_card', destGroupId: "sharedEncounterDeck", position: "s"}}>Shuffle in (h)</MenuItem>
                     </SubMenu>
                     <SubMenu title="Owner's Deck">
                         <MenuItem onClick={handleMenuClick} data={{action: 'move_card', destGroupId: card.owner+"Deck", position: "t"}}>Top</MenuItem>
                         <MenuItem onClick={handleMenuClick} data={{action: 'move_card', destGroupId: card.owner+"Deck", position: "b"}}>Bottom</MenuItem>
                         <MenuItem onClick={handleMenuClick} data={{action: 'move_card', destGroupId: card.owner+"Deck", position: "s"}}>Shuffle in (h)</MenuItem>
                     </SubMenu>
                     <MenuItem onClick={handleMenuClick} data={{ action: 'move_card', destGroupId: "sharedVictory", position: "t" }}>Victory Display</MenuItem>
                 </SubMenu>
                 <SubMenu title='Per round'>
                     {["Resource", "Progress", "Damage"].map((tokenType, tokenIndex) => (
                        <SubMenu title={tokenType}>
                            <MenuItem onClick={handleMenuClick} data={{action: 'update_tokens_per_round', tokenType: tokenType.toLowerCase(), increment: -5}}>-5 {card.tokensPerRound[tokenType.toLowerCase()]==-5 ? "✓" : ""}</MenuItem>
                            <MenuItem onClick={handleMenuClick} data={{action: 'update_tokens_per_round', tokenType: tokenType.toLowerCase(), increment: -4}}>-4 {card.tokensPerRound[tokenType.toLowerCase()]==-4 ? "✓" : ""}</MenuItem>
                            <MenuItem onClick={handleMenuClick} data={{action: 'update_tokens_per_round', tokenType: tokenType.toLowerCase(), increment: -3}}>-3 {card.tokensPerRound[tokenType.toLowerCase()]==-3 ? "✓" : ""}</MenuItem>
                            <MenuItem onClick={handleMenuClick} data={{action: 'update_tokens_per_round', tokenType: tokenType.toLowerCase(), increment: -2}}>-2 {card.tokensPerRound[tokenType.toLowerCase()]==-2 ? "✓" : ""}</MenuItem>
                            <MenuItem onClick={handleMenuClick} data={{action: 'update_tokens_per_round', tokenType: tokenType.toLowerCase(), increment: -1}}>-1 {card.tokensPerRound[tokenType.toLowerCase()]==-1 ? "✓" : ""}</MenuItem>
                            <MenuItem onClick={handleMenuClick} data={{action: 'update_tokens_per_round', tokenType: tokenType.toLowerCase(), increment:  0}}>0 {card.tokensPerRound[tokenType.toLowerCase()]==0 ? "✓" : ""}</MenuItem>
                            <MenuItem onClick={handleMenuClick} data={{action: 'update_tokens_per_round', tokenType: tokenType.toLowerCase(), increment:  1}}>+1 {card.tokensPerRound[tokenType.toLowerCase()]==1 ? "✓" : ""}</MenuItem>
                            <MenuItem onClick={handleMenuClick} data={{action: 'update_tokens_per_round', tokenType: tokenType.toLowerCase(), increment:  2}}>+2 {card.tokensPerRound[tokenType.toLowerCase()]==2 ? "✓" : ""}</MenuItem>
                            <MenuItem onClick={handleMenuClick} data={{action: 'update_tokens_per_round', tokenType: tokenType.toLowerCase(), increment:  3}}>+3 {card.tokensPerRound[tokenType.toLowerCase()]==3 ? "✓" : ""}</MenuItem>
                            <MenuItem onClick={handleMenuClick} data={{action: 'update_tokens_per_round', tokenType: tokenType.toLowerCase(), increment:  4}}>+4 {card.tokensPerRound[tokenType.toLowerCase()]==4 ? "✓" : ""}</MenuItem>
                            <MenuItem onClick={handleMenuClick} data={{action: 'update_tokens_per_round', tokenType: tokenType.toLowerCase(), increment:  5}}>+5 {card.tokensPerRound[tokenType.toLowerCase()]==5 ? "✓" : ""}</MenuItem>
                        </SubMenu>
                    ))}
                 </SubMenu>
             </ContextMenu>
         {/* </ArcherElement> */}


         </div>
    )
})


// class CardClass extends Component {

//     shouldComponentUpdate = (nextProps, nextState) => {
        
//         if ( 
//             (JSON.stringify(nextProps.inputCard)!==JSON.stringify(this.props.inputCard)) ||
//             (nextProps.groupId!==this.props.groupId) ||
//             (nextProps.stackIndex!==this.props.stackIndex) ||
//             (nextProps.cardIndex!==this.props.cardIndex)
//         ) {
//             return true;
//         } else {
//             return false; 
//         }
//     };
  
//     render() {
//         return(
//             <CardComponent
//                 inputCard={this.props.inputCard}
//                 cardIndex={this.props.cardIndex}
//                 stackIndex={this.props.stackIndex}
//                 groupId={this.props.groupId}
//                 gameBroadcast={this.props.gameBroadcast}
//                 chatBroadcast={this.props.chatBroadcast}
//                 playerN={this.props.playerN}
//             ></CardComponent>
//         )
//     }
// }


// const CardView = React.memo(({
//     inputCard,
//     cardIndex,
//     stackIndex,
//     groupId,
//     gameBroadcast,
//     chatBroadcast,
//     playerN,
//   }) => {
//     //if (groupId==='sharedStaging') console.log('rendering Cardview');
//     console.log('rendering',groupId,stackIndex,cardIndex, "view");
//     const cardObj = JSON.parse(inputCard);
//     return (
//         <CardClass
//             inputCard={cardObj}
//             cardIndex={cardIndex}
//             stackIndex={stackIndex}
//             groupId={groupId}
//             gameBroadcast={gameBroadcast}
//             chatBroadcast={chatBroadcast}
//             playerN={playerN}
//         ></CardClass>
//     )
// });

// export default CardView;



