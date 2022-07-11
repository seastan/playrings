import React, {useContext, useEffect, useState} from "react";
import { useDispatch, useSelector } from 'react-redux';
import ReactModal from "react-modal";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CYCLEORDER, CYCLEINFO } from "../plugins/lotrlcg/definitions/constants";
import { calcHeightCommon, DropdownItem, GoBack } from "./DropdownMenuHelpers";
import useProfile from "../../hooks/useProfile";
import { setShowModal, setTooltipIds, setTyping } from "../store/playerUiSlice";
import store from "../../store";
import { loadDeckFromXmlText, refinedLoadList } from "../plugins/lotrlcg/functions/helpers";
import { useGameL10n } from "../../hooks/useGameL10n";
import BroadcastContext from "../../contexts/BroadcastContext";
import { useGameDefinition } from "./functions/useGameDefinition";
import { useLoadList } from "./functions/useLoadList";

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
    const privacyType = useSelector(state => state?.gameUi?.privacyType);
    const options = useSelector(state => state.gameUi?.game?.options);
    const myUser = useProfile();
    const [filteredIds, setFilteredIds] = useState([]);
    const [activeMenu, setActiveMenu] = useState({"name": "Load a deck", "subMenus": gameDef.deckMenu});
    const [returnToMenu, setReturnToMenu] = useState(null);
    const [menuHeight, setMenuHeight] = useState(null);
    const [searchString, setSearchString] = useState("");
    const loadList = useLoadList();

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
      loadList(gameDef.preBuiltDecks[props.deckListId].cards);
      chatBroadcast("game_update",{message: "loaded a deck."});
      dispatch(setShowModal(null))
    }

    const calcHeight = (el) => {
      calcHeightCommon(el, setMenuHeight);
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
                  const questName = gameDef.preBuiltDecks?.[filteredId]?.name;
                  return(
                    <tr className="bg-gray-600 text-white cursor-pointer hover:bg-gray-500 hover:text-black" onClick={() => handleSpawnClick(filteredId)}>
                      <td className="p-1">{questName}</td>
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
                  deckListId={deckListOption.deckListId}
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