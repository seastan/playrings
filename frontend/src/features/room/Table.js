import React, { useEffect } from "react";
import { TableLayout } from "./TableLayout";
import { GiantCard } from "./GiantCard";
import { TopBar } from "./TopBar";
import { SpawnCardModal } from "./SpawnCardModal";
import { SpawnCustomModal } from "./SpawnCustomModal";
import { SpawnQuestModal } from "./SpawnQuestModal";
import { SpawnCampaignModal } from "./SpawnCampaignModal";
import { SideBar } from "./SideBar";
import { Hotkeys } from "./Hotkeys";
import { PlayersInRoom } from "./PlayersInRoom";
import { DropdownMenu } from "./DropdownMenu";
import { OnLoad } from "./OnLoad";
import { TouchBarBottom } from "./TouchBarBottom";

import "../../css/custom-dropdown.css";
import { TooltipModal } from "./TooltipModal";
import { setActiveCardObj, setDropdownMenuObj, setMousePosition, setTouchAction } from "../store/playerUiSlice";
import { useDispatch, useSelector } from "react-redux";

export const Table = React.memo(({
  gameBroadcast,
  chatBroadcast,
  registerDivToArrowsContext
}) => {
  console.log('Rendering Table');
  const dispatch = useDispatch();
  const tooltipIds = useSelector(state => state?.playerUi?.tooltipIds);
  const touchMode = useSelector(state => state?.playerUi?.touchMode);
  const showModal = useSelector(state => state?.playerUi?.showModal);
  const loaded = useSelector(state => state?.playerUi?.loaded);

  const handleTableClick = (event) => {
    dispatch(setActiveCardObj(null));
    dispatch(setDropdownMenuObj(null));
    dispatch(setTouchAction(null));
  }

  useEffect(() => {
    const handleMouseDown = (event) => {
      dispatch(setMousePosition({
        x: event.clientX,
        y: event.clientY,
      }))
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    }
  })

  return (
    <div className="h-full flex" style={{fontSize: "1.7vh"}}
      //onTouchStart={(event) => handleTableClick(event)} onMouseUp={(event) => handleTableClick(event)}
      onClick={(event) => handleTableClick(event)}>
      <DropdownMenu
        gameBroadcast={gameBroadcast}
        chatBroadcast={chatBroadcast}
      />
      {loaded? null : <OnLoad gameBroadcast={gameBroadcast} chatBroadcast={chatBroadcast}/>}
      <Hotkeys/>
      <PlayersInRoom/>
      {/* Side panel */}
      <SideBar
        gameBroadcast={gameBroadcast}
        chatBroadcast={chatBroadcast}
      />
      {/* Main panel */}
      <div className="w-full">
        <div className="w-full h-full">
          {/* Game menu bar */}
          <div className="bg-gray-600 text-white w-full" style={{height: "6%"}}>
            <TopBar
              gameBroadcast={gameBroadcast}
              chatBroadcast={chatBroadcast}
            />
          </div>
          {/* Table */}
          <div className="relative w-full" style={{height: touchMode ? "82%" : "94%"}}>
            <TableLayout
              gameBroadcast={gameBroadcast} 
              chatBroadcast={chatBroadcast}
              registerDivToArrowsContext={registerDivToArrowsContext}
            />
          </div>
          {/* Touch Bar */}
          {touchMode && <div className="relative bg-gray-700 w-full" style={{height: "12%"}}>
              <TouchBarBottom/>
          </div>}
        </div>
      </div>
      {/* Card hover view */}
      <GiantCard/>
      {showModal === "card" ? <SpawnCardModal gameBroadcast={gameBroadcast} chatBroadcast={chatBroadcast}/> : null}
      {showModal === "quest" ? <SpawnQuestModal gameBroadcast={gameBroadcast} chatBroadcast={chatBroadcast}/> : null}
      {showModal === "custom" ? <SpawnCustomModal gameBroadcast={gameBroadcast} chatBroadcast={chatBroadcast}/> : null}
      {showModal === "campaign" ? <SpawnCampaignModal gameBroadcast={gameBroadcast} chatBroadcast={chatBroadcast}/> : null}
      {tooltipIds.map((tooltipId, index) => {
        return(
        <TooltipModal
          tooltipId={tooltipId}
          gameBroadcast={gameBroadcast}
        />)
      })}
    </div>
  );
})







