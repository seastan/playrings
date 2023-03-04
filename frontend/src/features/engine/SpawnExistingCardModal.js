import React, {useContext, useEffect, useState} from "react";
import ReactModal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import useProfile from "../../hooks/useProfile";
import { setShowModal, setTyping } from "../store/playerUiSlice";
import { useGameL10n } from "../../hooks/useGameL10n";
import BroadcastContext from "../../contexts/BroadcastContext";
import { usePlugin } from "./functions/usePlugin";
import { useGameDefinition } from "./functions/useGameDefinition";

const RESULTS_LIMIT = 150;

export const SpawnExistingCardModal = React.memo(({}) => {
  const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
    const dispatch = useDispatch();
    const l10n = useGameL10n();
    const myUser = useProfile();
    const playerN = useSelector(state => state?.playerUi?.playerN);
    const plugin = usePlugin();
    const gameDef = useGameDefinition();
    console.log("pluginspawn", plugin)
    const cardDb = plugin?.card_db || {};
    const [loadGroupId, setLoadGroupId] = useState(gameDef?.spawnExistingCardModal?.spawnGroupIds[0])

    console.log("spawn cardDb", cardDb)

    const [spawnFilteredIDs, setSpawnFilteredIDs] = useState(Object.keys(cardDb));
    if (Object.keys(cardDb).length === 0) return;

    const handleGroupIdChange = (event) => {
      console.log("groupidchange", event.target.value)
      setLoadGroupId(event.target.value);
    }

    const handleSpawnClick = (cardID) => {
        const cardDetails = cardDb[cardID];
        if (!cardDetails || !playerN) return;
        const loadList = [{'cardDetails': cardDetails, 'quantity': 1, 'loadGroupId': loadGroupId}]
        gameBroadcast("game_action", {action: "load_cards", options: {load_list: loadList}});
        chatBroadcast("game_update", {message: "spawned "+cardDetails["A"]["name"]+"."});
    }

    const handleSpawnTyping = (event) => {
        //setSpawnCardName(event.target.value);
        const filteredName = event.target.value;
        const filteredIDs = []; //Object.keys(cardDB);
        Object.keys(cardDb).map((cardID, index) => {
          const cardRow = cardDb[cardID]
          const sideA = cardRow["A"]
          const cardName = sideA["name"];
          if (cardName.toLowerCase().includes(filteredName.toLowerCase())) filteredIDs.push(cardID);
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
        className="insert-auto overflow-auto p-5 bg-gray-700 border max-w-lg mx-auto my-12 rounded-lg outline-none max-h-3/4">
        <h1 className="mb-2">{l10n("Spawn card")}</h1>
        <div><span className="text-white">Load group: </span>
          <select className="form-control mb-1" style={{width:"35%"}} id={"loadGroupId"} name={"loadGroupId"} onChange={(event) => handleGroupIdChange(event)}>
            {gameDef?.spawnExistingCardModal?.spawnGroupIds.map((groupId,_groupIndex) => (
              <option value={groupId}>{gameDef?.groups?.[groupId]?.name}</option>
            ))}
          </select>
        </div>
        <input 
          autoFocus
          style={{width:"50%"}} 
          type="text"
          id="name" 
          name="name" 
          className="mb-6 mt-5 rounded" 
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
                  {gameDef.spawnExistingCardModal?.columnProperties?.map((prop, colindex) => {
                    return(
                      <th key={colindex} className="p-1">{prop}</th>
                    )
                  })}
                </tr>
              </thead>
              {spawnFilteredIDs.map((cardId, rowindex) => {
                const card = cardDb[cardId];
                const sideA = cardDb[cardId]["A"];
                return(
                  <tr key={rowindex} className="bg-gray-600 text-white cursor-pointer hover:bg-gray-500 hover:text-black" onClick={() => handleSpawnClick(cardId)}>
                    {gameDef.spawnExistingCardModal.columnProperties?.map((prop, colindex) => {
                      return(
                        <td key={colindex} className="p-1">{sideA[prop]}</td>
                      )
                    })}
                  </tr>
                );
              })}
            </table> :
            <div className="text-white">No results</div>
        }
      </ReactModal>
    )
})