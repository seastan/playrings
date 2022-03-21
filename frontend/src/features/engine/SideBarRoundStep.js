import React, { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { setActiveCardObj } from "../store/playerUiSlice";
import { getDisplayName } from "../plugin/Helpers";


export const ReminderButton = React.memo(({
  triggerCardIds,
  gameBroadcast,
  chatBroadcast,
}) => {  
  const dispatch = useDispatch();
  const numTriggers = triggerCardIds ? triggerCardIds.length : 0;
  const cardById = useSelector(state => state?.gameUi?.game?.cardById);
  const playerN = useSelector(state => state?.playerUi?.playerN)
  const triggerCard = triggerCardIds?.length === 1 ? cardById[triggerCardIds[0]] : null;
  const targetTriggers = (event) => {
    event.stopPropagation();
    if (!playerN) return;
    // Remove targets from all cards you targeted
    gameBroadcast("game_action", {
        action: "action_on_matching_cards", 
        options: {
            criteria:[["targeting", playerN, true]], 
            action: "update_card_values", 
            options: {updates: [["targeting", playerN, false]]}
        }
    });
    chatBroadcast("game_update", {message: "removes targets."})
    gameBroadcast("game_action", {action: "target_card_ids", options:{card_ids: triggerCardIds}});
    for (var cardId of triggerCardIds) {
      const card = cardById[cardId];
      const displayName = getDisplayName(card);
      chatBroadcast("game_update", {message: "targeted "+displayName+"."});
    }
  }  
  const handleStartHover = () => {
    dispatch(setActiveCardObj({
      card: triggerCard,
      mousePosition: "top", 
      screenPosition: "left",
      clicked: false,
      setIsActive: null,
      groupId: null,
      groupType: null,
      cardIndex: null,
  }));
  }
  const handleStopHover = () => {
    dispatch(setActiveCardObj(null));
  };
  return(
    <div 
      className="absolute flex items-center justify-center bg-red-800 hover:bg-red-600 border"
      style={{height:"2.5vh", width:"2.5vh", right:"-2vh", borderRadius: "2.5vh"}}
      onClick={(event) => targetTriggers(event)}
      onMouseEnter={() => handleStartHover()}
      onMouseLeave={() => handleStopHover()}>
      {numTriggers}
    </div>
  )
})

export const SideBarRoundStep = React.memo(({
  phase,
  stepInfo, 
  gameBroadcast,
  chatBroadcast,
}) => {
  const gameRoundStep = useSelector(state => state?.gameUi?.game?.roundStep);
  const playerN = useSelector(state => state?.playerUi?.playerN)
  const triggerCardIds = useSelector(state => state?.gameUi?.game?.triggerMap?.[stepInfo.id]);
  const numTriggers = triggerCardIds ? triggerCardIds.length : 0;
  const [hovering, setHovering] = useState(null);
  const isRoundStep = (gameRoundStep === stepInfo.id);

  console.log("Rendering SideBarRoundStep", stepInfo);
  const handleButtonClick = (id, text) => {
    if (!playerN) return;
    gameBroadcast("game_action", {action: "update_values", options:{updates: [["game", "roundStep", id], ["game", "phase", phase]]}});     
    chatBroadcast("game_update", {message: "set the round step to "+text+"."})
  }


  return (
    <div 
      key={stepInfo.id}
      className={`flex flex-1 items-center`} 
      style={{
        width: hovering ? "575px" : "100%",
        fontSize: "1.7vh",
      }}
      onClick={() => handleButtonClick(stepInfo.id, stepInfo.text)}
      onMouseEnter={() => setHovering(stepInfo.id)}
      onMouseLeave={() => setHovering(null)}
    >
      <div className="flex justify-center" style={{width:"3vh"}}/>
      <div className={`flex h-full items-center justify-center ${isRoundStep ? "bg-red-800" : "bg-gray-500"} ${stepInfo.actions ? "underline" : ""}`} style={{width:"3vh"}}>
        {stepInfo.id}
      </div>
      {numTriggers > 0 &&
        <ReminderButton
          triggerCardIds={triggerCardIds}
          gameBroadcast={gameBroadcast}
          chatBroadcast={chatBroadcast}
        />
      }
      <div className={`flex flex-1 h-full items-center justify-center ${isRoundStep ? "bg-red-800" : "bg-gray-500"} ${hovering ? "block" : "hidden"}`} >
        <div dangerouslySetInnerHTML={{ __html: stepInfo.text }} />
      </div>
    </div>
  )
})