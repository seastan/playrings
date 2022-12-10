import React, {useContext, useEffect, useState} from "react";
import ReactModal from "react-modal";
import { useForm } from "react-hook-form";
import Button from "../../components/basic/Button";
import Select from 'react-select'
import { setShowModal, setTyping } from "../store/playerUiSlice";
import { useDispatch, useSelector } from "react-redux";
import BroadcastContext from "../../contexts/BroadcastContext";
import { useGameDefinition } from "./functions/useGameDefinition";
import { usePlugin } from "./functions/usePlugin";
import { Divider } from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronLeft, faChevronRight, faCross, faDownload, faPlay, faPlus, faSave, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons";
import useProfile from "../../hooks/useProfile";
import { useAuthOptions } from "../../hooks/useAuthOptions";
import axios from "axios";
import useDataApi from "../../hooks/useDataApi";
import { format } from "date-fns";
import { RotatingLines } from "react-loader-spinner";

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

const keyClass = "m-auto border cursor-pointer bg-gray-500 hover:bg-gray-400 text-center bottom inline-block";
const keyStyle = {width: "3vh", height: "3vh", borderRadius: "0.5vh"}

export const DeckbuilderModal = React.memo(({}) => {
  const dispatch = useDispatch();
  const user = useProfile();
  const gameDef = useGameDefinition();
  const authOptions = useAuthOptions();
  const deckbuilder = gameDef.deckbuilder;
  const spawnGroups = deckbuilder.spawnGroups;
  const cardDb = usePlugin()?.card_db || {};
  const pluginId = useSelector(state => state?.gameUi?.game?.pluginId);
  const [spawnFilteredIDs, setSpawnFilteredIDs] = useState(Object.keys(cardDb));
  const [hoverCardDetails, setHoverCardDetails] = useState();
  const [filters, setFilters] = useState();
  const [currentGroupId, setCurrentGroupId] = useState(spawnGroups?.[0]?.id);
  const [currentDeck, setCurrentDeck] = useState({});
  const [numChanges, setNumChanges] = useState(0);
  dispatch(setTyping(true));
  const myDecksUrl = `/be/api/v1/decks/${user?.id}/${pluginId}`;
  const defaultName = "Untitled";

  const { data, isLoading, isError, doFetchUrl, doFetchHash, setData } = useDataApi(
    myDecksUrl,
    null
  );  
  const myDecks = data?.my_decks;
  console.log("myDecks",myDecks)
  useEffect(() => {
    if (user?.id) doFetchUrl(myDecksUrl);
  }, [user]);
  console.log('Rendering Decks', data);
  
  useEffect(() => {
    if (numChanges > 10) {
      saveCurrentDeck(false);
      setNumChanges(0);
    }
  }, [numChanges]);

  if (!cardDb) return;

  const modifyDeckList = (cardUuid, quantity, groupId, existingIndex = null) => {
    console.log("modifyDeckList", cardUuid, quantity, groupId, existingIndex)
    // If it's already in the deck, adjust the quantity
    const deckCopy = {...currentDeck}
    console.log("modifyDeckList deckCopy", deckCopy)
    if (existingIndex !== null) {
      deckCopy.quantities[existingIndex] += quantity; 
    }
    // See if item should be deleted
    if (existingIndex !== null && deckCopy.quantities[existingIndex] <= 0) {
      deckCopy.card_uuids.splice(existingIndex, 1);
      deckCopy.quantities.splice(existingIndex, 1);
      deckCopy.load_group_ids.splice(existingIndex, 1);
      setHoverCardDetails(null);
    }
    // If it was not in the group already, add it to the deck
    if (existingIndex === null) {
      deckCopy.card_uuids.push(cardUuid);
      deckCopy.quantities.push(quantity);
      deckCopy.load_group_ids.push(groupId);
    }
    setCurrentDeck(deckCopy);
    setNumChanges(numChanges + 1);
  }

  const createNewDeck = async() => {
    const updateData = {deck: {
      name: defaultName,
      author_id: user?.id,
      plugin_id: pluginId,
      card_uuids: [],
      quantities: [],
      load_group_ids: []
    }}
    const res = await axios.post("/be/api/v1/decks", updateData, authOptions);
    console.log("myDecks 2", res)
    if (res.status == 200) {
      console.log("myDecks 3", res?.data?.success?.deck)

      setCurrentDeck(res.data.success.deck);
    }
    doFetchHash((new Date()).toISOString());
  }

  const saveCurrentDeck = async() => {
    const updateData = {deck: currentDeck}
    console.log("myDecks writing")
    const res = await axios.patch(`/be/api/v1/decks/${currentDeck.id}`, updateData, authOptions);
    setNumChanges(0);
    doFetchHash((new Date()).toISOString());
  }

  const deleteCurrentDeck = async() => {
    const updateData = {deck: currentDeck}
    console.log("myDecks writing")
    const res = await axios.delete(`/be/api/v1/decks/${currentDeck.id}`, updateData, authOptions);
    setNumChanges(0);
    doFetchHash((new Date()).toISOString());
    setCurrentDeck({});
  }

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
    <ReactModal
      closeTimeoutMS={200}
      isOpen={true}
      onRequestClose={() => {
        dispatch(setShowModal(null));
        dispatch(setTyping(false));
      }}
      contentLabel="Build a deck"
      overlayClassName="fixed inset-0 bg-black-50 z-10000"
      className="relative flex insert-auto overflow-auto p-5 bg-gray-700 border mx-auto my-12 rounded-lg outline-none"
      style={{
        content: {
          width: "92vw",
          height: "85vh",
          maxHeight: "85vh",
          overflowY: "scroll",
        }
      }}>
      {hoverCardDetails?.A?.imageUrl && <CardImage url={hoverCardDetails.A.imageUrl} top={"0%"} height={hoverCardDetails?.B?.imageUrl ? "50%" : "70%"}/>}
      {hoverCardDetails?.B?.imageUrl && <CardImage url={hoverCardDetails.B.imageUrl} top={"50%"} height={"50%"}/>}
      {/* <h1 className="mb-2">Spawn a custom card</h1> */}
      {isLoading &&
        <div className="absolute flex h-full w-full items-center justify-center opacity-80 bg-gray-700">
          <RotatingLines
            height={100}
            width={100}
            strokeColor="white"/>
        </div>
      }
      <div className="w-full h-full flex">
      
      <div className="flex" style={{width:"20%", backgroundColor:"red"}}>
        <div className="justify-center p-2 m-2 text-white w-full">
          <div className="relative justify-center mb-2">
            <div className="float-left text-xl mr-2">My Decks</div>
            <div 
              className={keyClass}
              style={keyStyle}
              onClick={()=>{createNewDeck()}}>
                <FontAwesomeIcon icon={faUpload}/>
            </div> 
            <div 
              className={keyClass}
              style={keyStyle}
              onClick={()=>{createNewDeck()}}>
                <FontAwesomeIcon icon={faPlus}/>
            </div> 
          </div>
          {myDecks?.map((deck, _index) => {
            return(
              <div 
                className={"relative text-white px-2 py-1 mt-2 cursor-pointer " + (deck.id === currentDeck?.id ? "bg-red-800" : "bg-gray-800")}
                onClick={() => {setCurrentDeck(deck);}}>
                <div className="p-2 inline-block">{deck.name}</div>
              </div>
            )
          })}
        </div>
      </div>
      
      {currentDeck?.id && <div className="" style={{width:"20%", backgroundColor:"blue"}}>
          <div className="justify-center p-2 m-2 text-white">
            <div className="flex justify-center">Current Deck</div>
              <div className="flex justify-center">
                <div>
                <div 
                  className={keyClass} 
                  style={keyStyle}
                  onClick={()=>{deleteCurrentDeck()}}>
                    <FontAwesomeIcon icon={faTrash}/>
                </div>
                <div 
                  className={keyClass} 
                  style={keyStyle}
                  onClick={()=>{saveCurrentDeck()}}>
                    <FontAwesomeIcon icon={faDownload}/>
                </div>
                <div 
                  className={keyClass} 
                  style={keyStyle}
                  onClick={()=>{saveCurrentDeck()}}>
                    <FontAwesomeIcon icon={faPlay}/>
                </div>
                </div>
              </div>
            <div className="">
              <input 
                autoFocus 
                type="text"
                id="deckNameInput" 
                name="deckNameInput" 
                className="m-2 rounded w-3/4 text-black" 
                placeholder={"Deck Name"}
                value={currentDeck.name}
                onChange={(event) => setCurrentDeck({...currentDeck, name: event.target.value})}/>
              <div 
                className={keyClass} 
                style={keyStyle}
                onClick={()=>{saveCurrentDeck()}}>
                  <FontAwesomeIcon icon={faSave}/>
              </div>            
            </div>
          </div>
        
        {spawnGroups?.map((groupInfo, _groupIndex) => {
          const groupId = groupInfo.id;
          return(
            <div>
              <div 
                className={"text-white pl-3 py-1 mt-2 cursor-pointer " + (currentGroupId === groupId ? "bg-red-800" : "bg-gray-800")}
                onClick={() => setCurrentGroupId(groupId)}>
                {groupInfo.label}
              </div>
              {currentDeck?.card_uuids?.map((cardUuid, index) => {
                if (currentDeck.load_group_ids[index] === groupId)
                return(
                  <div className="relative p-1 bg-yellow-800 text-white"
                    onMouseMove={() => {setHoverCardDetails(cardDb[cardUuid])}}
                    onMouseLeave={() => setHoverCardDetails(null)}>
                    <div 
                      className={keyClass} 
                      style={keyStyle}
                      onClick={()=>modifyDeckList(cardUuid, -currentDeck.quantities[index], groupId, index)}>
                        <FontAwesomeIcon icon={faTrash}/>
                    </div>
                    <div className="inline-block px-2 max-w-1/2">{cardDb[cardUuid].A.name}</div>
                    <div className="absolute p-1 right-0 top-0">
                      <div 
                        className={keyClass} 
                        style={keyStyle}
                        onClick={()=>modifyDeckList(cardUuid, -1, groupId, index)}>
                          <FontAwesomeIcon icon={faChevronLeft}/>
                      </div>
                      <div className="inline-block px-2">{currentDeck.quantities[index]}</div>
                      <div 
                        className={keyClass} 
                        style={keyStyle}
                        onClick={()=>modifyDeckList(cardUuid, 1, groupId, index)}>
                          <FontAwesomeIcon icon={faChevronRight}/>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>}

      {currentDeck.id && <div className="" style={{width:"60%"}}>
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
                  className="bg-gray-600 text-white hover:bg-gray-500" 
                  onClick={() => {}}
                  onMouseEnter={() => {setHoverCardDetails(null); setHoverCardDetails(cardDetails)}}
                  onMouseLeave={() => setHoverCardDetails(null)}>
                  <td key={-1} className="p-1">
                    {deckbuilder.addButtons.map((addButtonVal, _index) => {
                      return(
                        <div 
                          className={keyClass} 
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
      }

      </div>
      </ReactModal>
    )
})