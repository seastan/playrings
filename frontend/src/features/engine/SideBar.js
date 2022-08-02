import React from "react";
import { SideBarPhase } from "./SideBarPhase";
import { SideBarNewRound } from "./SideBarNewRound";
import { useGameDefinition } from "./functions/useGameDefinition";

export const SideBar = React.memo(({}) => {
  const gameDef = useGameDefinition();
  return(
    <div className="bg-gray-500" style={{width:"6vh", zIndex: 1e6}}>
      <div className="bg-red-300" style={{height:"3vh"}}>
        <SideBarNewRound/>
      </div>
      <div style={{height:"calc(100% - 3vh)"}}>
        {gameDef.phaseOrder.map((phaseId, _phaseIndex) => {
          return(<SideBarPhase phaseId={phaseId}/>)
      })}
      </div>
    </div>
  )
})
