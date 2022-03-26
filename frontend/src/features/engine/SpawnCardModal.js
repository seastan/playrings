import React, {useContext, useState} from "react";
import ReactModal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import useProfile from "../../hooks/useProfile";
import { getCardRowCategory } from "../plugins/lotrlcg/functions/helpers";
import { setShowModal, setTyping } from "../store/playerUiSlice";
import { useGameL10n } from "../../hooks/useGameL10n";
import { cardDb } from "../plugins/lotrlcg/functions/cardDb";
import BroadcastContext from "../../contexts/BroadcastContext";

const RESULTS_LIMIT = 150;

export const SpawnCardModal = React.memo(({}) => {
  const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
    const dispatch = useDispatch();
    const l10n = useGameL10n();
    const myUser = useProfile();
    const playerN = useSelector(state => state?.playerUi?.playerN);

    const [spawnFilteredIDs, setSpawnFilteredIDs] = useState(Object.keys(cardDb));

    const handleSpawnClick = (cardID) => {
        const cardRow = cardDb[cardID];
        if (!cardRow || !playerN) return;
        const cardRowCategory = getCardRowCategory(cardRow);
        const loadGroupId = cardRowCategory === "Player" ? playerN + "Play1" : "sharedStaging";
        const deckGroupId = cardRowCategory === "Player" ? playerN + "Deck" : "shared"+cardRowCategory+"Deck";
        cardRow['deckgroupid'] = deckGroupId;
        if (cardRowCategory === "Quest") cardRow['discardgroupid'] = "sharedQuestDiscard";
        else if (cardRowCategory === "Encounter") cardRow['discardgroupid'] = "sharedEncounterDiscard";
        else cardRow['discardgroupid'] = playerN+"Discard";
        const loadList = [{'cardRow': cardRow, 'quantity': 1, 'groupId': loadGroupId}]
        gameBroadcast("game_action", {action: "load_cards", options: {load_list: loadList}});
        chatBroadcast("game_update", {message: "spawned "+cardRow["sides"]["A"]["printname"]+"."});
    }

    const handleSpawnTyping = (event) => {
        //setSpawnCardName(event.target.value);
        const filteredName = event.target.value;
        const filteredIDs = []; //Object.keys(cardDB);
        Object.keys(cardDb).map((cardID, index) => {
          const cardRow = cardDb[cardID]
          const sideA = cardRow["sides"]["A"]
          const cardName = sideA["name"];
          const cardPack = cardRow["cardpackname"]
          if (
            (cardName.toLowerCase().includes(filteredName.toLowerCase()) 
            //|| cardPack.toLowerCase().includes(filteredName.toLowerCase()) 
            //|| sideA.type.toLowerCase().includes(filteredName.toLowerCase())
             ) &&
            !cardPack.toLowerCase().includes("custom") &&
            !(cardRow["playtest"] && !myUser.playtester)
          ) filteredIDs.push(cardID);
        })
        setSpawnFilteredIDs(filteredIDs);
    }

    return(
      <ReactModal
        closeTimeoutMS={200}
        isOpen={true}
        onRequestClose={() => dispatch(setShowModal(null))}
        contentLabel="Spawn a card"
        overlayClassName="fixed inset-0 bg-black-50 z-10000"
        className="insert-auto overflow-auto p-5 bg-gray-700 border max-w-lg mx-auto my-12 rounded-lg outline-none max-h-3/4"
      >
        <h1 className="mb-2">{l10n("Spawn card")}</h1>
        <input 
          autoFocus
          style={{width:"50%"}} 
          type="text"
          id="name" 
          name="name" 
          className="mb-6 mt-5" 
          placeholder=" Card name..." 
          onChange={handleSpawnTyping}
          onFocus={event => dispatch(setTyping(true))}
          onBlur={event => dispatch(setTyping(false))}/>
        {(spawnFilteredIDs.length) ? 
          (spawnFilteredIDs.length>RESULTS_LIMIT) ?
            <div className="text-white">Too many results</div> :
            <table className="table-fixed rounded-lg w-full overflow-h-scroll">
              <thead>
                <tr className="text-white bg-gray-800">
                  <th className="w-1/2">Name</th>
                  <th className="w-1/2">Set</th>
                </tr>
              </thead>
              {spawnFilteredIDs.map((cardId, index) => {
                const card = cardDb[cardId];
                const sideA = cardDb[cardId]["sides"]["A"];
                const printName = sideA.printname;
                return(
                  <tr className="bg-gray-600 text-white cursor-pointer hover:bg-gray-500 hover:text-black" onClick={() => handleSpawnClick(cardId)}>
                    <td className="p-1">{printName}</td>
                    <td>{card.cardpackname}</td>
                  </tr>
                );
              })}
            </table> :
            <div className="text-white">No results</div>
        }
      </ReactModal>
    )
})