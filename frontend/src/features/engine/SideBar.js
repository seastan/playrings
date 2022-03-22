import React from "react";
import { SideBarPhase } from "./SideBarPhase";
import { PHASEINFO } from "../plugins/lotrlcg/definitions/constants";
import { SideBarNewRound } from "./SideBarNewRound";

export const SideBar = React.memo(({
  gameBroadcast,
  chatBroadcast,
}) => {
  return(
    <div className="bg-gray-500" style={{width:"6vh", zIndex: 1e6}}>
      <div className="bg-red-300" style={{height:"3vh"}}>
        <SideBarNewRound
          gameBroadcast={gameBroadcast}
          chatBroadcast={chatBroadcast}
        />
      </div>
      <div style={{height:"calc(100% - 3vh)"}}>
        {PHASEINFO.map((phase, _phaseIndex) => (
          <SideBarPhase
            gameBroadcast={gameBroadcast}
            chatBroadcast={chatBroadcast}
            phaseInfo={phase}
          />
        ))}
      </div>
    </div>
  )
})
