import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { TopBarViewItem } from "./TopBarViewItem";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setShowHotkeys, setShowModal, setShowPlayersInRoom } from "../store/playerUiSlice";
import { useGameDefinition } from "./hooks/useGameDefinition";
import { usePlayerIList } from "./hooks/usePlayerIList";
import { useSiteL10n } from "../../hooks/useSiteL10n";

const keyClass = "m-auto border bg-gray-500 text-center inline-block ml-2";
const keyStyleL = {width: "7vh", height: "3vh", borderRadius: "1vh", fontSize: "1.5vh"}

export const TopBarView = React.memo(({}) => {
  const siteL10n = useSiteL10n();
  const dispatch = useDispatch();
  const gameDef = useGameDefinition();  
  return(
    <li>
      <div className="h-full flex items-center justify-center select-none" href="#">{siteL10n("view")}</div>
        <ul className="second-level-menu">
          <li key={"hotkeys"} onClick={() => dispatch(setShowHotkeys(true))}>
            {siteL10n("hotkeys")} <div className={keyClass} style={keyStyleL}>Tab</div>
          </li>
          <li key={"preferences"} onClick={() => dispatch(setShowModal("settings"))}>
            {siteL10n("preferences")} <div className={keyClass + " mr-2"} style={keyStyleL}>Shift</div>+<div className={keyClass} style={keyStyleL}>Tab</div>
          </li>
          <li key={"playersInRoom"} onClick={() => dispatch(setShowPlayersInRoom(true))}>
            {siteL10n("spectators")}
          </li>

          <li key={"shared"}>
            
            {siteL10n("shared")}
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
            {siteL10n("player")+" "+(playerIndex+1)}
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