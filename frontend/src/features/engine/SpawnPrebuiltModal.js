import React, {useContext, useState} from "react";
import { useDispatch } from 'react-redux';
import ReactModal from "react-modal";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DropdownItem, GoBack } from "./DropdownMenuHelpers";
import useProfile from "../../hooks/useProfile";
import { setShowModal, setTyping } from "../store/playerUiSlice";
import { useGameL10n } from "./hooks/useGameL10n";
import BroadcastContext from "../../contexts/BroadcastContext";
import { useGameDefinition } from "./hooks/useGameDefinition";
import { useLoadList } from "./hooks/useLoadList";
import { useDoActionList } from "./hooks/useDoActionList";

const isStringInDeckName = (str, deckName) => {
  const lowerCaseString = str.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const lowerCaseDeckName = deckName.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  // const strippedString = lowerCaseString.replace(/[^A-z]/ig, "");
  // const strippedDeckName = lowerCaseQuestName.replace(/[^A-z]/ig, "");
  return lowerCaseDeckName.includes(lowerCaseString);
}

export const SpawnPrebuiltModal = React.memo(({}) => { 
  const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext); 
    const dispatch = useDispatch();
    const l10n = useGameL10n();
    const gameDef = useGameDefinition();
    const myUser = useProfile();
    const [filteredIds, setFilteredIds] = useState([]);
    const [activeMenu, setActiveMenu] = useState({"name": "Load a deck", ...gameDef.deckMenu});
    const [menuHeight, setMenuHeight] = useState(null);
    const [searchString, setSearchString] = useState("");
    const loadList = useLoadList();
    const doActionList = useDoActionList();

    const handleSpawnClick = (id) => {
      loadList(gameDef.preBuiltDecks[id].cards);
    }

    const handleSpawnTyping = (event) => {
      //setSpawnCardName(event.target.value);
      const newSearchString = event.target.value;
      setSearchString(newSearchString);
      const filtered = []; //Object.keys(cardDB);
      for (var deckId of Object.keys(gameDef.preBuiltDecks).sort().reverse()) {
        const deck = gameDef.preBuiltDecks[deckId];
        if (isStringInDeckName(newSearchString, deck.name) && !(deck.playtesting && !myUser.playtester)) filtered.push(deckId);
        setFilteredIds(filtered);
      }
    }

    const handleSubMenuClick = (props) => {
      const newMenu = {
        ...props.goToMenu,
        goBackMenu: activeMenu,
      }
      setActiveMenu(newMenu);
    }
    const handleGoBackClick = () => {
      setActiveMenu(activeMenu.goBackMenu);
    }
    const handleDeckListClick = (props) => {
      if (props.deckListOption.preLoadActionList) doActionList(props.deckListOption.actionList);
      loadList(gameDef.preBuiltDecks[props.deckListOption.deckListId].cards);
      if (props.deckListOption.postLoadActionList) doActionList(props.deckListOption.postLoadActionList);
      console.log("universalPostLoadActionList 1", gameDef.postLoadActionList)
      if (gameDef.postLoadActionList) {
        const universalPostLoadActionList = [
          ["DEFINE", "$DECK_LIST_ID", props.deckListOption.deckListId],
          ...gameDef.postLoadActionList
        ]
        console.log("universalPostLoadActionList 2", universalPostLoadActionList)
        doActionList(universalPostLoadActionList);
      }
      dispatch(setShowModal(null))
    }

    return(
      <ReactModal
        closeTimeoutMS={200}
        isOpen={true}
        onRequestClose={() => dispatch(setShowModal(null))}
        contentLabel={"Load quest"}
        overlayClassName="fixed inset-0 bg-black-50 z-10000"
        className="insert-auto p-5 bg-gray-700 border max-h-lg mx-auto my-2 rounded-lg outline-none"
        style={{
          content: {
            width: "600px",
            maxHeight: "95vh",
            overflowY: "scroll",
          }
        }}>
        <h1 className="mb-2">{l10n("Load prebuilt deck")}</h1>
        <input 
          autoFocus
          style={{width:"50%"}} 
          type="text"
          id="name" 
          name="name" 
          className="mb-2 rounded-md" 
          placeholder=" Deck name..." 
          onChange={handleSpawnTyping}
          onFocus={() => dispatch(setTyping(true))}
          onBlur={() => dispatch(setTyping(false))}/>

        {/* Table */}
        {searchString &&
          ((filteredIds.length === 0) ?
            <div className="text-white">{l10n("No results")}</div>
            :
            (filteredIds.length>25) ?
              <div className="text-white">{l10n("Too many results")}</div> 
              :
              <table className="table-fixed rounded-lg w-full">
                <thead>
                  <tr className="text-white bg-gray-800">
                    <th className="w-1/2">{l10n("Name")}</th>
                  </tr>
                </thead>
                {filteredIds.map((filteredId, index) => {
                  const deckName = gameDef.preBuiltDecks?.[filteredId]?.name;
                  return(
                    <tr className="bg-gray-600 text-white cursor-pointer hover:bg-gray-500 hover:text-black" onClick={() => handleSpawnClick(filteredId)}>
                      <td className="p-1">{deckName}</td>
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
          style={{ height: menuHeight}}>
          <div className="menu">
            {activeMenu.goBackMenu ?
              <GoBack clickCallback={handleGoBackClick}/> 
              : null
            }
            {activeMenu.subMenus?.map((subMenuOption, index) => {
              return(
                <DropdownItem
                  rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
                  goToMenu={subMenuOption}
                  clickCallback={handleSubMenuClick}>
                  {l10n(subMenuOption.name)}
                </DropdownItem>
              )
            })}
            {activeMenu.deckLists?.map((deckListOption, index) => {
              return(
                <DropdownItem
                  returnToMenu={activeMenu}
                  deckListOption={deckListOption}
                  clickCallback={handleDeckListClick}>
                  {l10n(deckListOption.nameOverride || gameDef.preBuiltDecks?.[deckListOption.deckListId]?.name)}
                </DropdownItem>
              )
            })}
          </div>
        </div>
        }
      </ReactModal>
    )
})