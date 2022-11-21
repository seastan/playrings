import React, {useContext, useEffect, useState} from "react";
import ReactModal from "react-modal";
import { useForm } from "react-hook-form";
import Button from "../../components/basic/Button";
import Select from 'react-select'
import { setShowModal, setTyping } from "../store/playerUiSlice";
import { useDispatch } from "react-redux";
import BroadcastContext from "../../contexts/BroadcastContext";
import { useGameDefinition } from "./functions/useGameDefinition";
import { usePlugin } from "./functions/usePlugin";
import { Divider } from "@material-ui/core";

const RESULTS_LIMIT = 150;

const CardImage = ({url, top, height}) => {
  return(
    <img 
      className="absolute"
      src={url} 
      onError={(_e)=>{}}
      style={{
        right: "0%",
        top: top,
        borderRadius: '5%',
        MozBoxShadow: '0 0 50px 20px black',
        WebkitBoxShadow: '0 0 50px 20px black',
        boxShadow: '0 0 50px 20px black',
        zIndex: 1e6,
        height: height,
      }}
    />
  )
}

const keyClass = "m-auto border bg-gray-500 text-center bottom inline-block";
const keyStyle = {width: "3vh", height: "3vh", borderRadius: "0.5vh"}

export const DeckbuilderModal = React.memo(({}) => {
  const dispatch = useDispatch();
  const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
  const gameDef = useGameDefinition();    
  const cardDb = usePlugin()?.card_db || {};
  const [spawnFilteredIDs, setSpawnFilteredIDs] = useState(Object.keys(cardDb));
  const [hoverCardDetails, setHoverCardDetails] = useState();
  const [filters, setFilters] = useState();
  
  if (!cardDb) return;

  const handleSpawnTyping = (event, propName) => {
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
        console.log()
        const matchSideA = (sideA[propName] !== null && sideA[propName] !== "" && String(sideA[propName]).toLowerCase().includes(String(filters[propName]).toLowerCase()))
        const matchSideB = (sideB[propName] !== null && sideB[propName] !== "" && String(sideB[propName]).toLowerCase().includes(String(filters[propName]).toLowerCase()))
        if (!(matchSideA || matchSideB)) match = false;        
      }
      if (match) filteredIDs.push(cardId);
    })
    setSpawnFilteredIDs(filteredIDs);
  }, [filters])

  return(
    <ReactModal
      closeTimeoutMS={200}
      isOpen={true}
      onRequestClose={() => dispatch(setShowModal(null))}
      contentLabel="Spawn a custom card"
      overlayClassName="fixed inset-0 bg-black-50 z-10000"
      className="insert-auto overflow-auto p-5 bg-gray-700 border mx-auto my-12 rounded-lg outline-none"
      style={{
        content: {
          width: "50vw",
          maxHeight: "85vh",
          overflowY: "scroll",
        }
      }}>
      {hoverCardDetails?.A?.imageUrl && <CardImage url={hoverCardDetails.A.imageUrl} top={"0%"} height={hoverCardDetails?.B?.imageUrl ? "50%" : "70%"}/>}
      {hoverCardDetails?.B?.imageUrl && <CardImage url={hoverCardDetails.B.imageUrl} top={"50%"} height={"50%"}/>}
      {/* <h1 className="mb-2">Spawn a custom card</h1> */}
      {
          <table className="table-fixed rounded-lg w-full overflow-h-scroll">
            <thead>
              <tr className="bg-gray-800">
                <th key={-1} className="text-white p-1">Add</th>
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
                          className="mb-6 mt-5 rounded" 
                          placeholder={"Filter "+colDetails.propLabel} 
                          onChange={(event) => {handleSpawnTyping(event, colDetails.propName)}}
                          onFocus={event => dispatch(setTyping(true))}
                          onBlur={event => dispatch(setTyping(false))}/>
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
                  className="bg-gray-600 text-white cursor-pointer hover:bg-gray-500" 
                  onClick={() => {}}
                  onMouseEnter={() => {setHoverCardDetails(null);setHoverCardDetails(cardDetails)}}
                  onMouseLeave={() => setHoverCardDetails(null)}>
                  <td key={-1} className="p-1">
                    <div className={keyClass + " hover:bg-gray-400"} style={keyStyle}>+1</div>
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
      }
      {spawnFilteredIDs.length > RESULTS_LIMIT && <div className="p-1 text-white">Too many results</div>} 


      </ReactModal>
    )
})