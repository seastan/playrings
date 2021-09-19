import React from "react";
import { useSelector } from 'react-redux';
import { GROUPSINFO } from "./Constants";
import { getQuestCompanionCycleFromQuestId } from "./Helpers";
import { getQuestNameFromModeAndId, getQuestNameFromPath } from "./SpawnQuestModal";
import { TopBarViewItem } from "./TopBarViewItem";


const keyClass = "m-auto border bg-gray-500 text-center bottom inline-block text-xs ml-2 mb-1";
const keyStyleL = {width: "35px", height: "20px", borderRadius: "5px"}

export const TopBarView = React.memo(({
  setShowHotkeys,
  setShowPlayersInRoom,
  handleBrowseSelect,
  playerN,
}) => {
  const numPlayersStore = state => state.gameUi.game.numPlayers;
  const numPlayers = useSelector(numPlayersStore);
  const questModeAndIdStore = state => state.gameUi.game.questModeAndId;
  const questModeAndId = useSelector(questModeAndIdStore);

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
            <a href="#" onClick={() => setShowHotkeys(true)}>Hotkeys <div className={keyClass} style={keyStyleL}>Tab</div></a>
          </li>
          <li key={"PlayersInRoom"}>
            <a href="#" onClick={() => setShowPlayersInRoom(true)}>Spectators</a>
          </li>
          <li key={"QuestCompanion"}>
            <a href={questCompanionURL} target="_blank">Quest Companion</a>
          </li>
          <li key={"Shared"}>
            <a href="#">Shared</a>
              <ul className="third-level-menu">
                {Object.keys(GROUPSINFO).map((groupId, _index) => {
                  if (groupId.startsWith("shared")) return (
                    <TopBarViewItem key={groupId} groupId={groupId} handleBrowseSelect={handleBrowseSelect} playerN={playerN}/>
                  )
                })}
            </ul>
          </li>
          {range(numPlayers, 1).map((N, _playerIndex) => (
          <li key={"player"+N}>
            <a href="#">Player {N}</a>
              <ul className="third-level-menu">
                {Object.keys(GROUPSINFO).map((groupId, _index) => {
                  if (groupId.startsWith("player"+N)) return (
                    <TopBarViewItem key={groupId} groupId={groupId} handleBrowseSelect={handleBrowseSelect} playerN={playerN}/>
                  )
                })}
            </ul>
          </li>
          ))}
      </ul>
    </li>
  )
})