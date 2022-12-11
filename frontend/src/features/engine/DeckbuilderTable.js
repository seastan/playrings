import React, {useEffect, useState} from "react";
import { useGameDefinition } from "./functions/useGameDefinition";
import { usePlugin } from "./functions/usePlugin";

const RESULTS_LIMIT = 150;

const keyClass = "m-auto border cursor-pointer bg-gray-500 hover:bg-gray-400 text-center bottom inline-block";
const keyStyle = {width: "3vh", height: "3vh", borderRadius: "0.5vh"}

export const DeckbuilderTable = React.memo(({currentGroupId, modifyDeckList, setHoverCardDetails}) => {
  const gameDef = useGameDefinition();
  const deckbuilder = gameDef.deckbuilder;
  console.log("deckbuilder", deckbuilder);
  console.log("deckbuilder addButtons",deckbuilder.addButtons);
  const addButtons = [...deckbuilder.addButtons];
  const addButtonsReversed = addButtons.reverse();
  console.log("deckbuilder addButtons r",addButtonsReversed);

  const cardDb = usePlugin()?.card_db || {};
  const [spawnFilteredIDs, setSpawnFilteredIDs] = useState(Object.keys(cardDb));
  const [filters, setFilters] = useState();
  console.log("addbuttons", addButtons)

  if (!cardDb) return;

  const handleFilterTyping = (event, propName) => {
    //setSpawnCardName(event.target.value);
    const filteredVal = event.target.value;
    setFilters({...filters, [propName]: filteredVal})
  }

  useEffect(() => {
    const filteredIDs = [];
    Object.keys(cardDb).map((cardId, _index) => {
      const cardDetails = cardDb[cardId];
      const sideA = cardDetails["A"];
      const sideB = cardDetails["B"];
      var match = true;
      for (var propName of Object.keys(filters)) {
        const matchSideA = (sideA[propName] !== null && sideA[propName] !== "" && String(sideA[propName]).toLowerCase().includes(String(filters[propName]).toLowerCase()))
        const matchSideB = (sideB[propName] !== null && sideB[propName] !== "" && String(sideB[propName]).toLowerCase().includes(String(filters[propName]).toLowerCase()))
        if (!(matchSideA || matchSideB)) match = false;        
      }
      if (match) filteredIDs.push(cardId);
    })
    setSpawnFilteredIDs(filteredIDs);
  }, [filters])

  return(
        <div className="" style={{width:"60%"}}>
          <table className="table-fixed rounded-lg w-full overflow-h-scroll">
            <thead>
              <tr className="bg-gray-800">
                <th key={-1} className="text-white p-1"></th>
                {gameDef.deckbuilder?.columns?.map((colDetails, colindex) => {
                  return(
                    <th key={colindex}>
                      <div className="text-white p-1">{colDetails.propLabel}</div>
                      <div>
                        <input 
                          autoFocus
                          style={{width:"95%"}} 
                          type="text"
                          id="name" 
                          name="name" 
                          className="m-2 rounded" 
                          placeholder={"Filter "+colDetails.propLabel} 
                          onChange={(event) => {handleFilterTyping(event, colDetails.propName)}}/>
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            {spawnFilteredIDs.length <= RESULTS_LIMIT && spawnFilteredIDs.map((cardId, rowindex) => {
              const cardDetails = cardDb[cardId];
              const sideA = cardDetails["A"];
              return(
                <tr 
                  key={rowindex} 
                  className="text-white hover:bg-gray-600" 
                  style={{color: deckbuilder.colorKey ? deckbuilder.colorValues[cardDetails.A[deckbuilder.colorKey]] : null}}
                  onClick={() => {}}
                  onMouseEnter={() => {setHoverCardDetails(null); setHoverCardDetails(cardDetails)}}
                  onMouseLeave={() => setHoverCardDetails(null)}>
                  <td key={-1} className="p-1">
                    {addButtonsReversed.map((addButtonVal, _index) => {
                      return(
                        <div 
                          className={keyClass + " float-right text-white"} 
                          style={keyStyle}
                          onClick={()=>modifyDeckList(cardId, addButtonVal, currentGroupId)}>
                            +{addButtonVal}
                        </div>
                      )
                    })}
                  </td>
                  {gameDef.deckbuilder?.columns?.map((colDetails, colindex) => {
                    return(
                      <td key={colindex} className="p-1">{sideA[colDetails.propName]}</td>
                    )
                  })}
                </tr>
              );
            })}
          </table>
      
        {spawnFilteredIDs.length > RESULTS_LIMIT && <div className="p-1 text-white">Too many results</div>} 
      </div>
    )
})