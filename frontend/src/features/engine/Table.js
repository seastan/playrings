import React, { useContext, useEffect } from "react";
import { TableLayout } from "./TableLayout";
import { GiantCard } from "./GiantCard";
import { TopBar } from "./TopBar";
import { SpawnCardModal } from "./SpawnCardModal";
import { SpawnCustomModal } from "./SpawnCustomModal";
import { SpawnPrebuiltModal } from "./SpawnPrebuiltModal";
import { SideBar } from "./SideBar";
import { Hotkeys } from "./Hotkeys";
import { PlayersInRoom } from "./PlayersInRoom";
import { DropdownMenu } from "./DropdownMenu";
import { TouchBarBottom } from "./TouchBarBottom";

import "../../css/custom-dropdown.css";
import { TooltipModal } from "./TooltipModal";
import { setActiveCardObj, setDropdownMenuObj, setMousePosition, setTouchAction } from "../store/playerUiSlice";
import { useDispatch, useSelector } from "react-redux";
import useProfile from "../../hooks/useProfile";
import { onLoad } from "../plugins/lotrlcg/functions/helpers";
import BroadcastContext from "../../contexts/BroadcastContext";

export const Table = React.memo(({registerDivToArrowsContext}) => {
  const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
  console.log('Rendering Table');
  const dispatch = useDispatch();
  const tooltipIds = useSelector(state => state?.playerUi?.tooltipIds);
  const touchMode = useSelector(state => state?.playerUi?.touchMode);
  const showModal = useSelector(state => state?.playerUi?.showModal);
  const options = useSelector(state => state?.gameUi?.game?.options); 
  const loaded = useSelector(state => state?.playerUi?.loaded);
  const redoStepsExist = useSelector(state => state?.gameUi?.game?.replayStep < state?.gameUi?.game?.replayLength-1);
  const myUserId = useProfile()?.id;
  const createdBy = useSelector(state => state.gameUi?.createdBy);
  const isHost = myUserId === createdBy;

  const handleTableClick = (event) => {
    dispatch(setActiveCardObj(null));
    dispatch(setDropdownMenuObj(null));
    dispatch(setTouchAction(null));
  }

  if (!loaded && isHost) onLoad(options, redoStepsExist, gameBroadcast, chatBroadcast, dispatch);

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
      <DropdownMenu/>
      <Hotkeys/>
      <PlayersInRoom/>
      {/* Side panel */}
      <SideBar/>
      {/* Main panel */}
      <div className="w-full">
        <div className="w-full h-full">
          {/* Game menu bar */}
          <div className="bg-gray-600 text-white w-full" style={{height: "6%"}}>
            <TopBar/>
          </div>
          {/* Table */}
          <div className="relative w-full" style={{height: touchMode ? "82%" : "94%"}}>
            <TableLayout registerDivToArrowsContext={registerDivToArrowsContext}/>
          </div>
          {/* Touch Bar */}
          {touchMode && <div className="relative bg-gray-700 w-full" style={{height: "12%"}}>
              <TouchBarBottom/>
          </div>}
        </div>
      </div>
      {/* Card hover view */}
      <GiantCard/>
      {showModal === "card" ? <SpawnCardModal/> : null}
      {showModal === "prebuilt_deck" ? <SpawnPrebuiltModal/> : null}
      {showModal === "custom" ? <SpawnCustomModal/> : null}
      {tooltipIds.map((tooltipId, index) => {
        return(
        <TooltipModal
          tooltipId={tooltipId}
        />)
      })}
    </div>
  );
})







