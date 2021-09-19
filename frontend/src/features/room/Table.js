import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from 'react-redux';
import { TableLayout } from "./TableLayout";
import { GiantCard } from "./GiantCard";
import { TopBar } from "./TopBar";
import { SpawnCardModal } from "./SpawnCardModal";
import { SpawnCustomModal } from "./SpawnCustomModal";
import { SpawnQuestModal } from "./SpawnQuestModal";
import { SideBar } from "./SideBar";
import { Hotkeys } from "./Hotkeys";
import { PlayersInRoom } from "./PlayersInRoom";
import { DropdownMenu } from "./DropdownMenu";
import { OnLoad } from "./OnLoad";
import { TouchBarBottom } from "./TouchBarBottom";
import { useKeypress } from "../../contexts/KeypressContext";
import { useTouchMode } from "../../contexts/TouchModeContext";

import "../../css/custom-dropdown.css";

import { useSetMousePosition } from "../../contexts/MousePositionContext";
import { useSetTouchAction } from "../../contexts/TouchActionContext";
import { useSetActiveCard } from "../../contexts/ActiveCardContext";
import { useSetDropdownMenu } from "../../contexts/DropdownMenuContext";
import { useCardSizeFactor } from "../../contexts/CardSizeFactorContext";

export const Table = React.memo(({
  playerN,
  gameBroadcast,
  chatBroadcast,
  setTyping,
  registerDivToArrowsContext
}) => {
  console.log('Rendering Table');
  const [showModal, setShowModal] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [showHotkeys, setShowHotkeys] = useState(false);
  const [showPlayersInRoom, setShowPlayersInRoom] = useState(false);
  const [sittingPlayerN, setSittingPlayerN] = useState("");
  // Show/hide group that allows you to browse certain cards in a group
  const [browseGroupId, setBrowseGroupId] = useState("");
  // Indices of stacks in group being browsed
  const [browseGroupTopN, setBrowseGroupTopN] = useState(0);
  const [observingPlayerN, setObservingPlayerN] = useState(playerN);

  const setMousePosition = useSetMousePosition();
  const setActiveCardAndLoc = useSetActiveCard();
  const setTouchAction = useSetTouchAction();
  const setDropdownMenu = useSetDropdownMenu();
  const keypress = useKeypress();    
  const cardSizeFactor = useCardSizeFactor();
  const touchMode = useTouchMode();

  const handleBrowseSelect = (groupId) => {
    setBrowseGroupId(groupId);
    setBrowseGroupTopN("All");
  }

  const handleTableClick = (event) => {
    setActiveCardAndLoc(null);
    setDropdownMenu(null);
    setTouchAction(null);
  }

  useEffect(() => {
    const handleMouseDown = (event) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
      })
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
        playerN={playerN}
        gameBroadcast={gameBroadcast}
        chatBroadcast={chatBroadcast}
      />
      {!loaded && <OnLoad setLoaded={setLoaded} gameBroadcast={gameBroadcast} chatBroadcast={chatBroadcast}/>}
      {(showHotkeys || keypress["Tab"]) && <Hotkeys tabMode={keypress["Tab"]} setShowWindow={setShowHotkeys}/>}
      {showPlayersInRoom && <PlayersInRoom setShowWindow={setShowPlayersInRoom}/>}
      {/* Side panel */}
      <SideBar
        playerN={playerN}
        gameBroadcast={gameBroadcast}
        chatBroadcast={chatBroadcast}
      />
      {/* Main panel */}
      <div className="w-full">
        <div className="w-full h-full">
          {/* Game menu bar */}
          <div className="bg-gray-600 text-white w-full" style={{height: "6%"}}>
            <TopBar
              setShowModal={setShowModal}
              setShowHotkeys={setShowHotkeys}
              setShowPlayersInRoom={setShowPlayersInRoom}
              handleBrowseSelect={handleBrowseSelect}
              gameBroadcast={gameBroadcast}
              chatBroadcast={chatBroadcast}
              playerN={playerN}
              sittingPlayerN={sittingPlayerN}
              setSittingPlayerN={setSittingPlayerN}
              observingPlayerN={observingPlayerN}
              setObservingPlayerN={setObservingPlayerN}
              setTyping={setTyping}
              setLoaded={setLoaded}/>
          </div>
          {/* Table */}
          <div className="relative w-full" style={{height: touchMode ? "82%" : "94%"}}>
            <TableLayout
              gameBroadcast={gameBroadcast} 
              chatBroadcast={chatBroadcast}
              playerN={playerN}
              setTyping={setTyping}
              browseGroupId={browseGroupId}
              setBrowseGroupId={setBrowseGroupId}
              browseGroupTopN={browseGroupTopN}
              setBrowseGroupTopN={setBrowseGroupTopN}
              registerDivToArrowsContext={registerDivToArrowsContext}
              cardSizeFactor={cardSizeFactor}
            />
          </div>
          {/* Touch Bar */}
          {touchMode && <div className="relative bg-gray-700 w-full" style={{height: "12%"}}>
              <TouchBarBottom/>
          </div>}
        </div>
      </div>
      {/* Card hover view */}
      <GiantCard playerN={playerN}/>
      {showModal === "card" && 
        <SpawnCardModal 
          playerN={playerN}
          setTyping={setTyping}
          setShowModal={setShowModal}
          gameBroadcast={gameBroadcast}
          chatBroadcast={chatBroadcast}
        />
      }
      {showModal === "quest" && 
        <SpawnQuestModal 
          playerN={playerN}
          setTyping={setTyping}
          setShowModal={setShowModal}
          gameBroadcast={gameBroadcast}
          chatBroadcast={chatBroadcast}
        />
      }
      {showModal === "custom" && 
        <SpawnCustomModal 
          setTyping={setTyping}
          setShowModal={setShowModal}
          gameBroadcast={gameBroadcast}
          chatBroadcast={chatBroadcast}
        />
      }
    </div>
  );
})







