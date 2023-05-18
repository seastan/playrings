import React from "react";
import { useSelector } from "react-redux";
import { useGameL10n } from "./hooks/useGameL10n";
import { useGameDefinition } from "./hooks/useGameDefinition";
import { SideBarRoundStep } from "./SideBarRoundStep";

export const SideBarPhase = React.memo(({
  phaseInfo,
  triggerMap,
}) => {
  const l10n = useGameL10n();
  const gameDef = useGameDefinition();
  const currentStepIndex = useSelector(state => state?.gameUi?.game?.stepIndex);
  const currentPhaseId = gameDef?.steps?.[currentStepIndex]?.phaseId;
  const phaseId = phaseInfo.phaseId;
  console.log("Rendering SideBarPhase", phaseId);
  const isPhase = phaseId === currentPhaseId;
  return (
    <div 
      className={"relative text-center select-none text-gray-100"}
      style={{height: phaseInfo.height, maxHeight: phaseInfo.height, borderBottom: (phaseId === "End") ? "" : "1px solid"}}>
      <div
        className={`absolute h-full pointer-events-none ${isPhase ? "bg-red-800" : ""}`}
        style={{width:"3vh"}}>
        <div className="absolute" style={{top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(90deg)"}}>
          {l10n(phaseInfo.labelId)}
        </div>
      </div>
      <div className="w-full h-full flex flex-col float-left">
        {gameDef?.steps?.map((stepInfo, _stepIndex) => {
          if (stepInfo?.phaseId == phaseId)
            return (
              <SideBarRoundStep
                key={stepInfo.stepId}
                stepInfo={stepInfo}
                triggerCardIds={triggerMap?.[stepInfo.stepId]}/>
            )
        })}
      </div>
    </div>
  )
})