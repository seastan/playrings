import React, {useState} from "react";
import { useDispatch } from 'react-redux';
import ReactModal from "react-modal";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DropdownItem, GoBack } from "./DropdownMenuHelpers";
import { setShowModal, setTyping } from "../store/playerUiSlice";
import { useGameL10n } from "./hooks/useGameL10n";
import { useGameDefinition } from "./hooks/useGameDefinition";
import { useSiteL10n } from "../../hooks/useSiteL10n";
import { useLoadPrebuiltDeck } from "./hooks/useLoadPrebuiltDeck";

const isStringInDeckName = (str, deckName) => {
  const lowerCaseString = str.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const lowerCaseDeckName = deckName.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  // const strippedString = lowerCaseString.replace(/[^A-z]/ig, "");
  // const strippedDeckName = lowerCaseQuestName.replace(/[^A-z]/ig, "");
  return lowerCaseDeckName.includes(lowerCaseString);
}

export const SpawnPrebuiltModal = React.memo(({}) => {
    const dispatch = useDispatch();
    const siteL10n = useSiteL10n();

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
        <h1 className="mb-2">{siteL10n("Load prebuilt deck")}</h1>
        <ModalContent/>
      </ReactModal>  
    )
})

const ModalContent = () => {
  const gameDef = useGameDefinition();
  const siteL10n = useSiteL10n();
  const [searchString, setSearchString] = useState("");
  const [filteredIds, setFilteredIds] = useState([]);

  if (!gameDef?.preBuiltDecks) return <div className="text-white">{siteL10n("noDefinedPreBuiltDecks")}</div>;
  else return(
    <>
      <InputBox 
        setFilteredIds={setFilteredIds} 
        searchString={searchString} 
        setSearchString={setSearchString}
      />
      {searchString 
        ? <Table filteredIds={filteredIds}/>
        : <Menu/>
      }
    </>
  );
}

const InputBox = ({
  setFilteredIds,
  searchString,
  setSearchString,
}) => {
  const gameDef = useGameDefinition();
  const gameL10n = useGameL10n();
  const dispatch = useDispatch();
  
  const handleSpawnTyping = (event) => {
    const newSearchString = event.target.value;
    setSearchString(newSearchString);
    console.log("decksearch for ", newSearchString, " in ", gameDef?.preBuiltDecks);
    const filtered = [];
    for (var deckId of Object.keys(gameDef.preBuiltDecks).sort().reverse()) {
      const deck = gameDef.preBuiltDecks[deckId];
      console.log("decksearch is ", newSearchString, " in ", gameL10n(deck.label), "?")
      if (isStringInDeckName(newSearchString, gameL10n(deck.label))) filtered.push(deckId);
      setFilteredIds(filtered);
    }
  }

  return(
    <input 
      autoFocus
      style={{width:"50%"}} 
      type="text"
      id="name" 
      name="name" 
      className="mb-2 rounded-md" 
      placeholder=" Deck name..." 
      value={searchString}
      onChange={(event) => handleSpawnTyping(event)}
      onFocus={() => dispatch(setTyping(true))}
      onBlur={() => dispatch(setTyping(false))}/>
  );
}

const Table = ({filteredIds}) => {
  const gameDef = useGameDefinition();
  const gameL10n = useGameL10n();
  const loadDeck = useLoadPrebuiltDeck();

  const handleSpawnClick = (id) => {
    loadDeck(id);
  }

  if (filteredIds.length === 0) return <div className="text-white">{gameL10n("No results")}</div>
  else if (filteredIds.length>25) return <div className="text-white">{gameL10n("Too many results")}</div>
  else return (
    <table className="table-fixed rounded-lg w-full">
      <thead>
        <tr className="text-white bg-gray-800">
          <th className="w-1/2">{gameL10n("Name")}</th>
        </tr>
      </thead>
      {filteredIds.map((filteredId, index) => {
        const deckName = gameDef.preBuiltDecks?.[filteredId]?.label;
        return(
          <tr className="bg-gray-600 text-white cursor-pointer hover:bg-gray-500 hover:text-black" onClick={() => handleSpawnClick(filteredId)}>
            <td className="p-1">{gameL10n(deckName)}</td>
          </tr>
        );
      })}
    </table>
  );
}

const Menu = ({}) => {
  const loadPrebuiltDeck = useLoadPrebuiltDeck();
  const gameL10n = useGameL10n();
  const gameDef = useGameDefinition();
  const dispatch = useDispatch();
  const [activeMenu, setActiveMenu] = useState({"name": "Load a deck", ...gameDef.deckMenu});

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
    loadPrebuiltDeck(props.deckListOption.deckListId);
    dispatch(setShowModal(null))
  }

  return(<div 
    className="modalmenu bg-gray-800">
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
            {gameL10n(subMenuOption.label)}
          </DropdownItem>
        )
      })}
      {activeMenu.deckLists?.map((deckListOption, index) => {
        return(
          <DropdownItem
            returnToMenu={activeMenu}
            deckListOption={deckListOption}
            clickCallback={handleDeckListClick}>
            {gameL10n(deckListOption.label)}
          </DropdownItem>
        )
      })}
    </div>
  </div>
  );
}
