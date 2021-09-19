import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { useSetActiveCard } from "../../contexts/ActiveCardContext";
import { getDisplayName } from "./Helpers";

export const ReminderButton = React.memo(({
  triggerCardIds,
  playerN,
  gameBroadcast,
  chatBroadcast,
}) => {  
  const numTriggers = triggerCardIds ? triggerCardIds.length : 0;
  const cardByIdStore = state => state?.gameUi?.game?.cardById; 
  const cardById = useSelector(cardByIdStore);
  const triggerCard = triggerCardIds?.length === 1 ? cardById[triggerCardIds[0]] : null;
  const setActiveCardAndLoc = useSetActiveCard();  
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
    setActiveCardAndLoc({
      card: triggerCard,
      mousePosition: "top", 
      screenPosition: "left",
      clicked: false,
      setIsActive: null,
      groupId: null,
      groupType: null,
      cardIndex: null,
  });
  }
  const handleStopHover = () => {
    setActiveCardAndLoc(null);
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
  playerN,
  phase,
  stepInfo, 
  gameBroadcast,
  chatBroadcast,
}) => {
  const gameRoundStepStore = state => state?.gameUi?.game?.roundStep;
  const gameRoundStep = useSelector(gameRoundStepStore);
  const triggerRoundStepStore = state => state?.gameUi?.game?.triggerMap?.[stepInfo.id];
  const triggerCardIds = useSelector(triggerRoundStepStore);
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
        width: hovering ? "375px" : "100%",
        fontSize: "1.7vh",
      }}
      onClick={() => handleButtonClick(stepInfo.id, stepInfo.text)}
      onMouseEnter={() => setHovering(stepInfo.id)}
      onMouseLeave={() => setHovering(null)}
    >
      <div className="flex justify-center" style={{width:"3vh"}}/>
      <div className={`flex h-full items-center justify-center ${isRoundStep ? "bg-red-800" : "bg-gray-500"}`} style={{width:"3vh"}}>
        {stepInfo.id}
      </div>
      {numTriggers > 0 &&
        <ReminderButton
          triggerCardIds={triggerCardIds}
          playerN={playerN}
          gameBroadcast={gameBroadcast}
          chatBroadcast={chatBroadcast}
        />
      }
      <div className={`flex flex-1 h-full items-center justify-center ${isRoundStep ? "bg-red-800" : "bg-gray-500"} ${hovering ? "block" : "hidden"}`} >
        {stepInfo.text}
      </div>
    </div>
  )
})