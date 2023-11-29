import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { TopBarViewItem } from "./TopBarViewItem";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setShowHotkeys, setShowModal, setShowPlayersInRoom } from "../store/playerUiSlice";
import { useGameL10n } from "./hooks/useGameL10n";
import { useGameDefinition } from "./hooks/useGameDefinition";
import { usePlayerIList } from "./hooks/usePlayerIList";

const keyClass = "m-auto border bg-gray-500 text-center bottom inline-block text-xs ml-2 mb-1";
const keyStyleL = {width: "35px", height: "20px", borderRadius: "5px"}

export const TopBarView = React.memo(({}) => {
  const l10n = useGameL10n();
  const dispatch = useDispatch();
  const gameDef = useGameDefinition();  
  return(
    <li>
      <div className="h-full flex items-center justify-center select-none" href="#">{l10n("View")}</div>
        <ul className="second-level-menu">
          <li key={"Hotkeys"} onClick={() => dispatch(setShowHotkeys(true))}>
            {l10n("Hotkeys")} <div className={keyClass} style={keyStyleL}>Tab</div>
          </li>
          <li key={"PluginPreferences"} onClick={() => dispatch(setShowModal("settings"))}>
            {l10n("PluginPreferences")} <div className={keyClass + " mr-2"} style={keyStyleL}>Shift</div>+<div className={keyClass} style={keyStyleL}>Tab</div>
          </li>
          <li key={"PlayersInRoom"} onClick={() => dispatch(setShowPlayersInRoom(true))}>
            {l10n("Spectators")}
          </li>

          <li key={"Shared"}>
            
            {l10n("Shared")}
              <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
            
            <ul className="third-level-menu">
              {Object.keys(gameDef?.groups).sort().map((groupId, _index) => {
                if (groupId.startsWith("shared")) return (
                  <TopBarViewItem key={groupId} groupId={groupId}/>
                )
              })}
            </ul>
          </li>
          {usePlayerIList().map((playerI, playerIndex) => (
          <li key={playerI}>
            {l10n("Player")+" "+(playerIndex+1)}
              <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
            <ul className="third-level-menu">
              {Object.keys(gameDef?.groups).sort().map((groupId, _index) => {
                if (groupId.startsWith(playerI)) return (
                  <TopBarViewItem key={groupId} groupId={groupId}/>
                )
              })}
            </ul>
          </li>
          ))}
      </ul>
    </li>
  )
})