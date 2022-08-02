import React from "react";
import { useSelector } from 'react-redux';
import { useGameL10n } from "../../hooks/useGameL10n";
import { useGameDefinition } from "./functions/useGameDefinition";
import { SideBarRoundStep } from "./SideBarRoundStep";

export const SideBarPhase = React.memo(({
  phaseId,
}) => {
  const l10n = useGameL10n();
  const gameDef = useGameDefinition();
  const phaseInfo = gameDef?.phases?.[phaseId];
  const phaseStore = state => state?.gameUi?.game?.phaseId;
  const currentPhase = useSelector(phaseStore);
  console.log("Rendering SideBarPhase", currentPhase, phaseInfo.label);
  const isPhase = phaseId === currentPhase;
  return (
    <div 
      className={"relative text-center select-none text-gray-100"}
      style={{height: phaseInfo.height, maxHeight: phaseInfo.height, borderBottom: (phaseId === "End") ? "" : "1px solid"}}>
      <div
        className={`absolute h-full pointer-events-none ${isPhase ? "bg-red-800" : ""}`}
        style={{width:"3vh"}}>
        <div className="absolute" style={{top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(90deg)"}}>
          {l10n(phaseInfo.label)}
        </div>
      </div>
      <div className="w-full h-full flex flex-col float-left">
        {phaseInfo.steps.map((stepId, _stepIndex) => {
          return (
            <SideBarRoundStep
              key={stepId}
              phaseId={phaseId}
              stepId={stepId}/>
          )
        })}
      </div>
    </div>
  )
})