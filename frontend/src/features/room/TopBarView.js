import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { GROUPSINFO } from "./Constants";
import { getQuestCompanionCycleFromQuestId } from "./Helpers";
import { getQuestNameFromModeAndId } from "./SpawnQuestModal";
import { TopBarViewItem } from "./TopBarViewItem";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setShowHotkeys, setShowPlayersInRoom } from "./playerUiSlice";


const keyClass = "m-auto border bg-gray-500 text-center bottom inline-block text-xs ml-2 mb-1";
const keyStyleL = {width: "35px", height: "20px", borderRadius: "5px"}

export const TopBarView = React.memo(({}) => {
  const numPlayers = useSelector(state => state.gameUi.game.numPlayers);
  const questModeAndId = useSelector(state => state.gameUi.game.questModeAndId);
  const dispatch = useDispatch();

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
      <div className="h-full flex items-center justify-center select-none" href="#">View</div>
        <ul className="second-level-menu">
          <li key={"Hotkeys"}>
            <a href="#" onClick={() => dispatch(setShowHotkeys(true))}>Hotkeys <div className={keyClass} style={keyStyleL}>Tab</div></a>
          </li>
          <li key={"PlayersInRoom"}>
            <a href="#" onClick={() => dispatch(setShowPlayersInRoom(true))}>Spectators</a>
          </li>
          <li key={"QuestCompanion"}>
            <a href={questCompanionURL} target="_blank">Quest Companion</a>
          </li>
          <li key={"Shared"}>
            <a href="#">
              Shared
              <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
            </a>
            <ul className="third-level-menu">
              {Object.keys(GROUPSINFO).map((groupId, _index) => {
                if (groupId.startsWith("shared")) return (
                  <TopBarViewItem key={groupId} groupId={groupId}/>
                )
              })}
            </ul>
          </li>
          {range(numPlayers, 1).map((N, _playerIndex) => (
          <li key={"player"+N}>
            <a href="#">
              Player {N}
              <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
            </a>
            <ul className="third-level-menu">
              {Object.keys(GROUPSINFO).map((groupId, _index) => {
                if (groupId.startsWith("player"+N)) return (
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