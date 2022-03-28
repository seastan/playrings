import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { GROUPSINFO } from "../definitions/constants";
import { getQuestCompanionCycleFromQuestId } from "../functions/helpers";
import { getQuestNameFromModeAndId } from "./SpawnQuestModal";
import { TopBarViewItem } from "./TopBarViewItem";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setShowHotkeys, setShowPlayersInRoom } from "../../../store/playerUiSlice";
import { useGameL10n } from "../../../../hooks/useGameL10n";
import { useGameDefinition } from "../../../engine/functions/useGameDefinition";


const keyClass = "m-auto border bg-gray-500 text-center bottom inline-block text-xs ml-2 mb-1";
const keyStyleL = {width: "35px", height: "20px", borderRadius: "5px"}

export const TopBarView = React.memo(({}) => {
  const l10n = useGameL10n();
  const numPlayers = useSelector(state => state.gameUi.game.numPlayers);
  const questModeAndId = useSelector(state => state.gameUi.game.questModeAndId);
  const dispatch = useDispatch();
  const gameDef = useGameDefinition();
  console.log("gamedef", gameDef)
  const range = (size, startAt = 0) => {
    return [...Array(size).keys()].map(i => i + startAt);
  }

  const questName = questModeAndId ? getQuestNameFromModeAndId(questModeAndId) : null;
  const questId = questModeAndId ? questModeAndId.slice(1) : null;
  const questCompanionCycle = questId ? getQuestCompanionCycleFromQuestId(questId) : null;
  var extension = "#" + questCompanionCycle + " quest " + questName;
  extension = extension.toLowerCase();
  extension = extension.replaceAll(" ","-");
  if (!questCompanionCycle) extension = "";
  var questCompanionURL = "https://lotr-lcg-quest-companion.gamersdungeon.net/" + extension;
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
          <li key={"QuestCompanion"}>
            <a href={questCompanionURL} target="_blank">{l10n("Quest Companion")}</a>
          </li>

          <li key={"Shared"}>
            
            {l10n("Shared")}
              <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
            
            <ul className="third-level-menu">
              {Object.keys(gameDef.groups).map((groupId, _index) => {
                const controller = gameDef.groups[groupId].controller;
                if (controller == "shared") return (
                  <TopBarViewItem key={groupId} groupId={groupId}/>
                )
              })}
            </ul>
          </li>
          {gameDef.players.map((playerI, _playerIndex) => (
          <li key={playerI}>
            {l10n(playerI)}
              <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
            <ul className="third-level-menu">
              {Object.keys(gameDef.groups).map((groupId, _index) => {
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