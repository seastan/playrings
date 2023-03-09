import React, {useEffect, useMemo, useState} from "react";
import { useGameDefinition } from "./functions/useGameDefinition";
import { usePlugin } from "./functions/usePlugin";
import { keyClass } from "../definitions/common";
import { keyStyle } from "../definitions/common";

const RESULTS_LIMIT = 250;

export const DeckbuilderTable = React.memo(({currentGroupId, modifyDeckList, setHoverCardDetails}) => {
  const gameDef = useGameDefinition();
  const deckbuilder = gameDef.deckbuilder;
  const addButtons = [...deckbuilder.addButtons];
  const addButtonsReversed = addButtons.reverse();

  const cardDb = usePlugin()?.card_db || {};
  const [filters, setFilters] = useState({});
  console.log("Rendering DeckbuilderTable", cardDb);

  const handleFilterTyping = (event, propName) => {
    const filteredVal = event.target.value;
    console.log("filtertype", filters, filteredVal, propName);
    setFilters({...filters, [propName]: filteredVal});
  };

  const spawnFilteredCardDetails = useMemo(() => {
    if (!cardDb) return [];
    return Object.values(cardDb).filter(cardDetails => {
      return Object.entries(filters).every(([propName, filterVal]) => {
        const sideA = cardDetails["A"];
        const matchSideA = (
          sideA[propName] !== null &&
          sideA[propName] !== "" &&
          String(sideA[propName]).toLowerCase().includes(String(filterVal).toLowerCase())
        );
        const sideB = cardDetails["B"];
        const matchSideB = (
          sideB[propName] !== null &&
          sideB[propName] !== "" &&
          String(sideB[propName]).toLowerCase().includes(String(filterVal).toLowerCase())
        );
        return matchSideA || matchSideB;
      });
    }).sort((a, b) => a.A.cardNumber === null || a.A.cardNumber > b.A.cardNumber );
  }, [cardDb, filters]);

  //return;
  if (!cardDb) return;

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
            {spawnFilteredCardDetails.length <= RESULTS_LIMIT && spawnFilteredCardDetails.map((cardDetails, rowindex) => {
              const sideA = cardDetails["A"];
              return(
                <tr 
                  key={rowindex} 
                  className="text-white hover:bg-gray-600" 
                  style={{color: deckbuilder.colorKey ? deckbuilder.colorValues[cardDetails.A[deckbuilder.colorKey]] : null}}
                  onClick={() => {}}
                  onMouseEnter={() => {setHoverCardDetails(null); setHoverCardDetails({...cardDetails, leftSide: true})}}
                  onMouseLeave={() => setHoverCardDetails(null)}>
                  <td key={-1} className="p-1">
                    {addButtonsReversed.map((addButtonVal, _index) => {
                      return(
                        <div 
                          className={keyClass + " float-right text-white"} 
                          style={keyStyle}
                          onClick={()=>modifyDeckList(sideA?.uuid, addButtonVal, currentGroupId)}>
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
      
        {spawnFilteredCardDetails.length > RESULTS_LIMIT && <div className="p-1 text-white">Too many results</div>} 
      </div>
    )
})