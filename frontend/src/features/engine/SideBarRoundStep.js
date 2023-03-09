import React, { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { setActiveCardObj } from "../store/playerUiSlice";
import { useGameL10n } from "../../hooks/useGameL10n";
import { useGameDefinition } from "./functions/useGameDefinition";
import { useDoActionList } from "./functions/useDoActionList";
import { dragnActionLists } from "../definitions/common";

export const ReminderButton = React.memo(({
  triggerCardIds
}) => {
  const dispatch = useDispatch();
  const numTriggers = triggerCardIds ? triggerCardIds.length : 0;
  const cardById = useSelector(state => state?.gameUi?.game?.cardById);
  const playerN = useSelector(state => state?.playerUi?.playerN)
  const triggerCard = triggerCardIds?.length === 1 ? cardById[triggerCardIds[0]] : null;
  const doActionList = useDoActionList();
  const targetTriggers = (event) => {
    event.stopPropagation();
    if (!playerN) return;
    doActionList(dragnActionLists.clearTargets());
    for (var cardId of triggerCardIds) {
      doActionList(dragnActionLists.targetCard(cardId));
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
      layoutType: null,
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
  stepInfo,
  triggerCardIds
}) => {
  const l10n = useGameL10n();
  const gameDef = useGameDefinition();
  const stepId = stepInfo?.stepId;
  const currentStepIndex = useSelector(state => state?.gameUi?.game?.stepIndex);
  const currentStepId = gameDef?.steps?.[currentStepIndex]?.stepId;
  const playerN = useSelector(state => state?.playerUi?.playerN)
  const [hovering, setHovering] = useState(null);
  const isRoundStep = (currentStepId === stepId);
  const doActionList = useDoActionList();

  console.log("Rendering SideBarRoundStep", stepInfo, triggerCardIds);
  const handleButtonClick = () => {
    if (!playerN) return;
    var stepIndex = 0;
    gameDef.steps.forEach((stepInfoI, index) => {
      if (stepInfoI.stepId == stepId) stepIndex = index;
    });
    doActionList(dragnActionLists.setStep(stepInfo, stepIndex));
  }

  return (
    <div 
      key={stepId}
      className={`flex flex-1 items-center`} 
      style={{
        width: hovering ? "750px" : "100%",
        fontSize: "1.7vh",
      }}
      onClick={() => handleButtonClick()}
      onMouseEnter={() => setHovering(stepId)}
      onMouseLeave={() => setHovering(null)}>
      <div className="flex justify-center" style={{width:"3vh"}}/>
      <div className={`flex h-full items-center justify-center ${isRoundStep ? "bg-red-800" : "bg-gray-500"} ${stepInfo.actions ? "underline" : ""}`} style={{width:"3vh"}}>
        {stepId}
      </div>
      {triggerCardIds?.length > 0 &&
        <ReminderButton
          triggerCardIds={triggerCardIds}/>
      }
      <div className={`flex flex-1 h-full items-center justify-center ${isRoundStep ? "bg-red-800" : "bg-gray-500"} ${hovering ? "block" : "hidden"}`} >
        <div>{l10n(stepId)}</div>
      </div>
    </div>
  )
})