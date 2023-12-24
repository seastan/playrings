import React, {useEffect, useMemo, useState} from "react";
import { useGameDefinition } from "./hooks/useGameDefinition";
import { usePlugin } from "./hooks/usePlugin";
import { keyClass } from "./functions/common";
import { keyStyle } from "./functions/common";
import { useGameL10n } from "./hooks/useGameL10n";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortUp, faSortDown, faSort } from '@fortawesome/free-solid-svg-icons';


const RESULTS_LIMIT = 250;

export const DeckbuilderTable = React.memo(({currentGroupId, modifyDeckList, setHoverCardDetails}) => {
  const gameDef = useGameDefinition();
  const deckbuilder = gameDef.deckbuilder;
  const [sortConfig, setSortConfig] = useState({ column: null, direction: null });
  const addButtons = [...deckbuilder.addButtons];
  const addButtonsReversed = addButtons.reverse();
  const gameL10n = useGameL10n();

  const cardDb = usePlugin()?.card_db || {};
  const [filters, setFilters] = useState({});
  console.log("Rendering DeckbuilderTable", cardDb);

  const handleFilterTyping = (event, propName) => {
    const filteredVal = event.target.value;
    console.log("filtertype", filters, filteredVal, propName);
    setFilters({...filters, [propName]: filteredVal});
  };

  const handleSort = (columnName) => {
    const direction = sortConfig.column === columnName && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ column: columnName, direction });
    // Add logic here to sort your data based on the sortConfig
  };
  

  useEffect(() => {
    const tableContainer = document.querySelector('.deckbuilder-table');
    if (tableContainer) {
      tableContainer.scrollLeft = 0;
    }
  }, []);


  const spawnFilteredCardDetails = useMemo(() => {
    if (!cardDb) return [];

    const sortedAndFiltered = Object.values(cardDb).filter(cardDetails => {
      return Object.entries(filters).every(([propName, filterVal]) => {
        const sideA = cardDetails["A"];
        const sideB = cardDetails["B"];
        const matchSideA = (
          sideA[propName] !== null &&
          sideA[propName] !== "" &&
          String(sideA[propName]).toLowerCase().includes(String(filterVal).toLowerCase())
        );
        const matchSideB = (
          sideB[propName] !== null &&
          sideB[propName] !== "" &&
          String(sideB[propName]).toLowerCase().includes(String(filterVal).toLowerCase())
        );
        return matchSideA || matchSideB;
      });
    });

    if (sortConfig.column) {
      sortedAndFiltered.sort((a, b) => {
        const aValue = a.A[sortConfig.column];
        const bValue = b.A[sortConfig.column];
        // Assuming string or number values, adjust if your data includes other types
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        // String comparison
        return sortConfig.direction === 'asc' ? aValue?.localeCompare(bValue) : bValue?.localeCompare(aValue);
      });
    }

    return sortedAndFiltered;
  }, [cardDb, filters, sortConfig]); // Make sure to include sortConfig in the dependency array


  //return;
  if (!cardDb) return;

  return(
        <div className="overflow-scroll deckbuilder-table" style={{width:"60%"}}>
          <table className="table-fixed rounded-lg w-full">
            <thead>
              <tr className="bg-gray-800">
                <th key={-1} className="text-white p-1" style={{width:"12vh"}}></th>
                  {gameDef.deckbuilder?.columns?.map((colDetails, colindex) => {
                    const isSorted = sortConfig.column === colDetails.propName;
                    return (
                      <th key={colindex} style={{width:"15vh"}}>
                        <div className="text-white p-1 flex justify-between items-center">
                          {gameL10n(colDetails.label)}
                          <div 
                            className="px-1 rounded border hover:bg-red-700"
                            onClick={() => handleSort(colDetails.propName)}>
                          <FontAwesomeIcon
                            icon={isSorted ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown) : faSort}
                            className="cursor-pointer"
                          />
                          </div>
                        </div>
                        <div>
                          <input 
                            autoFocus
                            style={{width:"95%"}} 
                            type="text"
                            id="name" 
                            name="name" 
                            className="m-2 rounded" 
                            placeholder={"Filter "+gameL10n(colDetails.label)} 
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
                          className={keyClass + " float-right text-white hover:bg-gray-400 cursor-pointer"} 
                          style={keyStyle}
                          onClick={()=>modifyDeckList(sideA?.databaseId, addButtonVal, currentGroupId)}>
                            +{addButtonVal}
                        </div>
                      )
                    })}
                  </td>
                  {gameDef.deckbuilder?.columns?.map((colDetails, colindex) => {
                    const content = sideA[colDetails.propName];
                    // Determine if the content length is less than 5
                    const isCenteredContent = (typeof content === 'string' && content.length === 1) || typeof content === 'number';
                    // Combine the classes based on the condition
                    const cellClass = `p-1 whitespace-nowrap text-ellipsis overflow-hidden ${isCenteredContent ? 'text-center' : ''}`;
                    return (
                      <td key={colindex} className={cellClass}>{content}</td>
                    );
                  })}
                </tr>
              );
            })}
          </table>
      
        {spawnFilteredCardDetails.length > RESULTS_LIMIT && <div className="p-1 text-white">Too many results</div>} 
      </div>
    )
})