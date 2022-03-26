import React from "react";
import { useSelector } from 'react-redux';
import { useGameL10n } from "../../hooks/useGameL10n";
import { SideBarRoundStep } from "./SideBarRoundStep";

export const SideBarPhase = React.memo(({
  phaseInfo,
}) => {
  const l10n = useGameL10n();
  const phaseStore = state => state?.gameUi?.game?.phase;
  const currentPhase = useSelector(phaseStore);
  console.log("Rendering SideBarPhase", currentPhase, phaseInfo.name);
  const isPhase = phaseInfo.name === currentPhase;
  return (
    <div 
      className={"relative text-center select-none text-gray-100"}
      style={{height: phaseInfo.height, maxHeight: phaseInfo.height, borderBottom: (phaseInfo.phase === "End") ? "" : "1px solid"}}>
      <div
        className={`absolute h-full pointer-events-none ${isPhase ? "bg-red-800" : ""}`}
        style={{width:"3vh"}}>
        <div className="absolute" style={{top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(90deg)"}}>
          {l10n(phaseInfo.label)}
        </div>
      </div>
      <div className="w-full h-full flex flex-col float-left">
        {phaseInfo.steps.map((step, _stepIndex) => {
          return (
            <SideBarRoundStep
              key={step.id}
              phase={phaseInfo.name}
              stepInfo={step}/>
          )
        })}
      </div>
    </div>
  )
})