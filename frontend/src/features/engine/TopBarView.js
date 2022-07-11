import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { TopBarViewItem } from "./TopBarViewItem";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setShowHotkeys, setShowPlayersInRoom } from "../store/playerUiSlice";
import { useGameL10n } from "../../hooks/useGameL10n";
import { useGameDefinition } from "./functions/useGameDefinition";
import { usePlayerIList } from "./functions/usePlayerIList";


const keyClass = "m-auto border bg-gray-500 text-center bottom inline-block text-xs ml-2 mb-1";
const keyStyleL = {width: "35px", height: "20px", borderRadius: "5px"}

export const TopBarView = React.memo(({}) => {
  const l10n = useGameL10n();
  const dispatch = useDispatch();
  const gameDef = useGameDefinition();  
  const playerData = useSelector(state => state?.gameUi?.game?.playerData); 
  return(
    <li>
      <div className="h-full flex items-center justify-center select-none" href="#">{l10n("View")}</div>
        <ul className="second-level-menu">
          <li key={"Hotkeys"} onClick={() => dispatch(setShowHotkeys(true))}>
            {l10n("Hotkeys")} <div className={keyClass} style={keyStyleL}>Tab</div>
          </li>
          <li key={"PlayersInRoom"} onClick={() => dispatch(setShowPlayersInRoom(true))}>
            {l10n("Spectators")}
          </li>

          <li key={"Shared"}>
            
            {l10n("Shared")}
              <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
            
            <ul className="third-level-menu">
              {Object.keys(gameDef.groups).sort().map((groupId, _index) => {
                const controller = gameDef.groups[groupId].controller;
                if (controller == "shared") return (
                  <TopBarViewItem key={groupId} groupId={groupId}/>
                )
              })}
            </ul>
          </li>
          {usePlayerIList().map((playerI, _playerIndex) => (
          <li key={playerI}>
            {l10n(playerI)}
              <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
            <ul className="third-level-menu">
              {Object.keys(gameDef.groups).sort().map((groupId, _index) => {
                if (gameDef.groups[groupId].controller === playerI) return (
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