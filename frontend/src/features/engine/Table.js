import React, { useEffect } from "react";
import { TableLayout } from "./TableLayout";
import { GiantCard } from "./GiantCard";
import { TopBar } from "./TopBar";
import { SpawnExistingCardModal } from "./SpawnExistingCardModal";
import { SpawnCustomCardModal } from "./SpawnCustomCardModal";
import { SpawnPrebuiltModal } from "./SpawnPrebuiltModal";
import { SideBar } from "./SideBar";
import { Hotkeys } from "./Hotkeys";
import { PlayersInRoom } from "./PlayersInRoom";
import { DropdownMenu } from "./DropdownMenu";
import { TouchBarBottom } from "./TouchBarBottom";

import "../../css/custom-dropdown.css";
import { TooltipModal } from "./TooltipModal";
import { setMouseXY, setDropdownMenu, setScreenLeftRight, setTouchAction, setActiveCardId, setShowModal } from "../store/playerUiSlice";
import { useDispatch, useSelector } from "react-redux";
import useProfile from "../../hooks/useProfile";
import BroadcastContext from "../../contexts/BroadcastContext";
import { DeckbuilderModal } from "./DeckbuilderModal";
import { PatreonModal } from "../support/PatreonModal";
import DeveloperModal from "./DeveloperModal";
import { usePlayerN } from "./hooks/usePlayerN";
import { pl } from "date-fns/locale";
import { usePreloadCardImages } from "../../hooks/usePreloadCardImages";

export const Table = React.memo(() => {
  const dispatch = useDispatch();
  const tooltipIds = useSelector(state => state?.playerUi?.tooltipIds);
  const touchMode = useSelector(state => state?.playerUi?.touchMode);
  const showModal = useSelector(state => state?.playerUi?.showModal);
  const showDeveloper = useSelector(state => state?.playerUi?.showDeveloper);
  const options = useSelector(state => state?.gameUi?.game?.options); 
  const loaded = useSelector(state => state?.playerUi?.loaded);
  const redoStepsExist = useSelector(state => state?.gameUi?.game?.replayStep < state?.gameUi?.game?.replayLength-1);
  const myUserId = useProfile()?.id;
  const createdBy = useSelector(state => state.gameUi?.createdBy);
  const isHost = myUserId === createdBy;
  const playerN = usePlayerN();
  usePreloadCardImages();
  console.log('Rendering Table 1', playerN);


  const handleTableClick = (event) => {
    dispatch(setMouseXY(null));
    dispatch(setDropdownMenu(null));
    dispatch(setActiveCardId(null));
    dispatch(setTouchAction(null));
  }

  //if (!loaded && isHost) onLoad(options, redoStepsExist, gameBroadcast, chatBroadcast, dispatch);

  // Handle mouse events
  useEffect(() => {
    const handleMouseDown = (event) => {
      dispatch(setMouseXY({
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
            <TableLayout/>
          </div>
          {/* Touch Bar */}
          {touchMode && <div className="relative bg-gray-700 w-full" style={{height: "12%"}}>
              <TouchBarBottom/>
          </div>}
        </div>
      </div>
      {/* Card hover view */}
      <GiantCard/>
      {showModal === "card" ? <SpawnExistingCardModal/> : null}
      {showModal === "prebuilt_deck" ? <SpawnPrebuiltModal/> : null}
      {showModal === "custom" ? <SpawnCustomCardModal/> : null}
      {showModal === "builder" ? <DeckbuilderModal/> : null}
      {showDeveloper ? <DeveloperModal/> : null}
      {showModal === "patreon" ? 
        <PatreonModal isOpen={true} isLoggedIn={myUserId} closeModal={() => dispatch(setShowModal(null))}/> : null}
      {tooltipIds.map((tooltipId, index) => {
        return(
        <TooltipModal
          tooltipId={tooltipId}
        />)
      })}
    </div>
  );
})







