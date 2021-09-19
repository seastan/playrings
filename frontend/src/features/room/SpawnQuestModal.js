import React, {useState} from "react";
import { useSelector } from 'react-redux';
import ReactModal from "react-modal";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { loadDeckFromXmlText } from "./Helpers";
import { CYCLEORDER, CYCLEINFO } from "./Constants";
import { calcHeightCommon, DropdownItem, GoBack } from "./DropdownMenuHelpers";
import useProfile from "../../hooks/useProfile";

function requireAll( requireContext ) {
  return requireContext.keys().map( requireContext );
}
const questsOCTGN = requireAll( require.context("../../../../../Lord-of-the-Rings/o8g/Decks/Quests/", true, /.o8d$/) );

const isStringInQuestPath = (str, questPath) => {
  const cleanQuest = getQuestNameFromPath(questPath)
  const lowerCaseString = str.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const lowerCaseQuestName = cleanQuest.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  // const strippedString = lowerCaseString.replace(/[^A-z]/ig, "");
  // const strippedDeckName = lowerCaseQuestName.replace(/[^A-z]/ig, "");
  return lowerCaseQuestName.includes(lowerCaseString);
}

export const getQuestNameFromModeAndId = (modeAndId) => {
  const index = getIndexFromModeAndId(modeAndId);
  const questPath = questsOCTGN[index];
  return getQuestNameFromPath(questPath);
}

const getQuestNameFromPath = (questPath) => {
  if (!questPath) return null;
  var name = questPath.split("/").pop();
  var mode = name.split('.').reverse()[3];
  name = name.split('.').reverse()[2];
  name = name.slice(2);
  name = name.replace(/-/ig, " ");
  if (name.slice(0,1) === " ") name = name.slice(1);
  return name;
}

const getQuestIdFromPath = (questPath) => {
  const name = questPath.split("/").pop();
  const id = name.split("-")[0];
  return id.slice(1); // Remove the "Q" in "Q01.01"
}

const getModeLetterFromPath = (questPath) => {
  const name = questPath.split("/").pop();
  const id = name.split("-")[0];
  return id.charAt(0); // Remove the "01.01" in "Q01.01"
}

const getModeLetterQuestIdFromPath = (questPath) => {
  const name = questPath.split("/").pop();
  const id = name.split("-")[0];
  return getModeLetterFromPath(questPath) + getQuestIdFromPath(questPath);
}

const getCycleIdFromPath = (questPath) => {
  const questId = getQuestIdFromPath(questPath);
  return questId.slice(0,2); // Remove the ".03" in "01.03"
}

const getModeNameFromPath = (questPath) => {
  const cycleId = getCycleIdFromPath(questPath);
  const modeLetter = getModeLetterFromPath(questPath);
  return getModeNameFromModeLetter(modeLetter) + (cycleId === "0C" ? " Campaign" : "");
}

const getModeNameFromModeLetter = (modeLetter) => {
  if (modeLetter === "E") return "Easy";
  else if (modeLetter === "N") return "Nightmare";
  else return "Normal";
}

const getQuestNameAndModeFromPath = (questPath) => {
  return getQuestNameFromPath(questPath) + " (" + getModeNameFromPath(questPath) + ")";
}

const getIndexFromModeAndId = (modeAndId) => { // modeAndId is "N01.01" or "Q01.01" or "E01.01"
  for (var i=0; i<questsOCTGN.length; i++) {
    const questPath = questsOCTGN[i];
    if (questPath.includes(modeAndId)) return i;
  }
  return -1;
}

export const loadDeckFromModeAndId = async(modeAndId, playerN, gameBroadcast, chatBroadcast) => {
  const index = getIndexFromModeAndId(modeAndId);
  if (index >= 0) {
    const questPath = questsOCTGN[index];
    const res = await fetch(questPath);
    const xmlText = await res.text();
    loadDeckFromXmlText(xmlText, playerN, gameBroadcast, chatBroadcast);
  }
  return null;
}

const isVisible = (questPath, playtester, privacyType) => {
  const questName = getQuestNameFromPath(questPath);
  if (questName.toLowerCase().includes("playtest") && (!playtester || privacyType === "public")) return false;
  else return true;
}

export const SpawnQuestModal = React.memo(({
    playerN,
    setTyping,
    setShowModal,
    gameBroadcast,
    chatBroadcast,
}) => {  
    const privacyTypeStore = state => state?.gameUi?.privacyType;
    const privacyType = useSelector(privacyTypeStore);
    const optionsStore = state => state.gameUi?.game?.options;
    const options = useSelector(optionsStore);
    const myUser = useProfile();
    const [filteredIndices, setFilteredIndices] = useState([]);
    const [activeMenu, setActiveMenu] = useState("main");
    const [menuHeight, setMenuHeight] = useState(null);
    const [searchString, setSearchString] = useState("");

    console.log("Rendering SpawnQuestModal", searchString);
    const handleSpawnClick = async(index) => {
      console.log(questsOCTGN[index])

      const res = await fetch(questsOCTGN[index]);
      const xmlText = await res.text();
      loadDeckFromXmlText(xmlText, playerN, gameBroadcast, chatBroadcast);
      setShowModal(null);
    }
      // reader.readAsText(questsOCTGN[index]);

    const handleSpawnTyping = (event) => {
      //setSpawnCardName(event.target.value);
      const newSearchString = event.target.value;
      setSearchString(newSearchString);
      const filtered = []; //Object.keys(cardDB);
      for (var i=0; i<questsOCTGN.length; i++) {
        const questName = questsOCTGN[i];
        if (isStringInQuestPath(newSearchString, questName) && isVisible(questName, myUser.playtester, privacyType)) filtered.push(i);
        setFilteredIndices(filtered);
      }
    }

    const handleDropdownClick = async(props) => {
      console.log(props);
      if (props.goToMenu) setActiveMenu(props.goToMenu);
      else if (props.questIndex !== null) {
        const questPath = questsOCTGN[props.questIndex];
        const res = await fetch(questPath);
        const xmlText = await res.text();
        loadDeckFromXmlText(xmlText, playerN, gameBroadcast, chatBroadcast);
        setShowModal(null);
        const modeAndId = getModeLetterQuestIdFromPath(questPath);
        const newOptions = {...options, questModeAndId: modeAndId};
        gameBroadcast("game_action", {action: "update_values", options: {updates: [["game","options", newOptions]]}});
        //gameBroadcast("game_action", {action: "update_values", options: {updates: [["game","questModeAndId", modeAndId]]}});
      }
    }

    const calcHeight = (el) => {
      calcHeightCommon(el, setMenuHeight);
    }

    return(
      <ReactModal
        closeTimeoutMS={200}
        isOpen={true}
        onRequestClose={() => setShowModal(null)}
        contentLabel="Load quest"
        overlayClassName="fixed inset-0 bg-black-50 z-10000"
        className="insert-auto p-5 bg-gray-700 border max-w-lg max-h-lg mx-auto my-2 rounded-lg outline-none"
        style={{
          content: {
            maxHeight: "95vh",
            overflowY: "scroll",
          }
        }}
      >
        <h1 className="mb-2">Load a quest</h1>
        <input 
          autoFocus
          style={{width:"50%"}} 
          type="text"
          id="name" 
          name="name" 
          className="mb-2 rounded-md" 
          placeholder=" Quest name..." 
          onChange={handleSpawnTyping}
          onFocus={event => setTyping(true)}
          onBlur={event => setTyping(false)}/>

        {/* Table */}
        {searchString &&
          ((filteredIndices.length === 0) ?
            <div className="text-white">No results</div>
            :
            (filteredIndices.length>25) ?
              <div className="text-white">Too many results</div> 
              :
              <table className="table-fixed rounded-lg w-full">
                <thead>
                  <tr className="text-white bg-gray-800">
                    <th className="w-1/2">Name</th>
                  </tr>
                </thead>
                {filteredIndices.map((filteredIndex, index) => {
                  const questName = questsOCTGN[filteredIndex];
                  return(
                    <tr className="bg-gray-600 text-white cursor-pointer hover:bg-gray-500 hover:text-black" onClick={() => handleSpawnClick(filteredIndex)}>
                      <td className="p-1">{getQuestNameAndModeFromPath(questName)}</td>
                    </tr>
                  );
                })}
              </table>
          )
        }
        {/* Menu */}
        {searchString === "" &&
          <div 
          className="modalmenu bg-gray-800" 
          style={{ height: menuHeight}}
          >
          {/* Cycle Menu */}
          {activeMenu === "main" &&
            <div className="menu">
              {CYCLEORDER.map((cycleId, index) => {
                if (cycleId === "PT" && (!myUser.playtester || privacyType === "public")) return null;
                else return(
                  <DropdownItem
                    rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
                    goToMenu={cycleId}
                    clickCallback={handleDropdownClick}>
                    {CYCLEINFO[cycleId].name}
                  </DropdownItem>
                )
              })}
            </div>
          }
          {/* Quest Menu */}
          {CYCLEORDER.map((cycleId, index) => {
            return(<>
              {activeMenu === cycleId &&
                <div className="menu">
                  <GoBack goToMenu="main" clickCallback={handleDropdownClick}/>
                  {questsOCTGN.map((questPath, index) => {
                    const modeLetter = getModeLetterFromPath(questPath);
                    if (cycleId === "PT" && questPath.toLowerCase().includes("playtest") && modeLetter !== "E" && privacyType !== "public") {
                      const questId = getQuestIdFromPath(questPath);
                      const selectedIndex = getIndexFromModeAndId(modeLetter+questId);
                      const selectedPath = questsOCTGN[selectedIndex];
                      if (selectedIndex >= 0) return(
                        <DropdownItem
                          questIndex={selectedIndex}
                          clickCallback={handleDropdownClick}>
                          {getQuestNameFromPath(questPath)}
                        </DropdownItem>
                      )
                    } else if (questPath.includes("Q"+cycleId) && !questPath.toLowerCase().includes("playtest")) {
                      return(
                        <DropdownItem
                          rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
                          goToMenu={getQuestIdFromPath(questPath)}
                          clickCallback={handleDropdownClick}>
                          {getQuestNameFromPath(questPath)}
                        </DropdownItem>
                      )
                    }
                  })}
                </div>
              }
            </>)
          })}
          {/* Difficulty menu */}
          {questsOCTGN.map((questPath, _) => {
            const questId = getQuestIdFromPath(questPath);
            const modeLetter = getModeLetterFromPath(questPath);
            const cycleId = getCycleIdFromPath(questPath);
            if (modeLetter === "Q") return(<>
              {activeMenu === questId &&
                <div className="menu">
                  <GoBack goToMenu={cycleId} clickCallback={handleDropdownClick}/>
                  {["E","Q","N"].map((modeLetter, letterIndex) => {
                    console.log(cycleId, questPath.toLowerCase())
                    const selectedIndex = getIndexFromModeAndId(modeLetter+questId);
                    if (selectedIndex >= 0) {
                      const selectedPath = questsOCTGN[selectedIndex];
                      if (cycleId !== "PT" && selectedPath?.toLowerCase().includes("playtest")) return null;
                      else return(
                        <DropdownItem
                          questIndex={selectedIndex}
                          clickCallback={handleDropdownClick}>
                          {getModeNameFromPath(selectedPath)}
                        </DropdownItem>
                      )
                    }
                  })}
                </div>
              }
            </>)
          })}
          </div>
        }
      </ReactModal>
    )
})