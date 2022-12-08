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
import { faChevronDown, faChevronLeft, faChevronRight, faSave } from "@fortawesome/free-solid-svg-icons";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons";
import useProfile from "../../hooks/useProfile";
import { useAuthOptions } from "../../hooks/useAuthOptions";
import axios from "axios";
import useDataApi from "../../hooks/useDataApi";
import { format } from "date-fns";

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

const keyClass = "m-auto border bg-gray-500 hover:bg-gray-400 text-center bottom inline-block";
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
  const [currentDeckId, setCurrentDeckId] = useState(null);
  const [currentDeckName, setCurrentDeckName] = useState("");
  dispatch(setTyping(true));
  const myDecksUrl = `/be/api/v1/decks/${user?.id}/${pluginId}`;

  const { data, isLoading, isError, doFetchUrl, doFetchHash, setData } = useDataApi(
    myDecksUrl,
    null
  );  
  const myDecks = data;
  console.log("myDecks",myDecks)
  useEffect(() => {
    if (user?.id) doFetchUrl(myDecksUrl);
  }, [user]);
  console.log('Rendering Decks', data);
  
  if (!cardDb) return;

  const modifyDeckList = (cardDetails, cardUuid, quantity, name, groupId) => {
    var groupCopy = [];
    if (currentDeck?.[groupId]) groupCopy = currentDeck[groupId]
    var groupListIndex = -1;
    // If it's already in the group, adjust the quantity
    if (groupCopy) groupCopy.forEach((deckItem, i) => {
      if (deckItem.cardUuid == cardUuid) {
        groupCopy[i].quantity += quantity;
        groupListIndex = i;
      }
    });
    // See if item should be deleted
    if (groupListIndex >= 0 && groupCopy[groupListIndex].quantity <= 0) {
      groupCopy.splice(groupListIndex, 1);
      setHoverCardDetails(null);
    }
    // If it was not in the group already, add it to the group
    if (groupListIndex < 0) {
      groupCopy.push({
        cardDetails: cardDetails,
        cardUuid: cardUuid,
        quantity: quantity,
        name: name
      })
    }
    setCurrentDeck({...currentDeck, [groupId]: groupCopy});
  }

  const saveCurrentDeck = async() => {
    const cardUuids = [];
    const quantities = [];
    const loadGroupIds = [];
    Object.keys(currentDeck).forEach((groupId) => {
      currentDeck[groupId].forEach((item) => {
        cardUuids.push(item.cardUuid);
        quantities.push(item.quantity);
        loadGroupIds.push(groupId);
      })
    })
    const updateData = {deck: {
      name: currentDeckName,
      author_id: user?.id,
      plugin_id: pluginId,
      card_uuids: cardUuids,
      quantities: quantities,
      load_group_ids: loadGroupIds
    }}
    console.log("myDecks writing")
    const res = await axios.post("/be/api/v1/decks", updateData, authOptions);
    if (res.status == 200) {
      
    }
    console.log("myDecks fetching", res);
    let ts = format(new Date(), "h:mm");
    ts = ts.slice(0, -1);
    doFetchHash(ts);
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
      onRequestClose={() => {
        dispatch(setShowModal(null));
        dispatch(setTyping(false));
      }}
      contentLabel="Build a deck"
      overlayClassName="fixed inset-0 bg-black-50 z-10000"
      className="flex insert-auto overflow-auto p-5 bg-gray-700 border mx-auto my-12 rounded-lg outline-none"
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
      <div className="flex" style={{width:"40%", backgroundColor:"red"}}>
        <div className="w-1/2" style={{backgroundColor:"green"}}>
          <div className="justify-center p-2 m-2 text-white">
            <div className="flex justify-center">My Decks</div>
            <div className="flex">
              <input 
                autoFocus 
                type="text"
                id="deckNameInput" 
                name="deckNameInput" 
                className="m-2 rounded w-3/4 text-black" 
                placeholder={"Deck Name"}
                onChange={(event) => setCurrentDeckName(event.target.value)}/>
              <div 
                className={keyClass} 
                style={keyStyle}
                onClick={()=>{saveCurrentDeck()}}>
                  <FontAwesomeIcon icon={faSave}/>
              </div>            
            </div>
          </div>       
        </div>
        <div className="w-1/2" style={{backgroundColor:"blue"}}>
          <div className="justify-center p-2 m-2 text-white">
            <div className="flex justify-center">Current Deck</div>
            <div className="flex">
              <input 
                autoFocus 
                type="text"
                id="deckNameInput" 
                name="deckNameInput" 
                className="m-2 rounded w-3/4 text-black" 
                placeholder={"Deck Name"}
                onChange={(event) => setCurrentDeckName(event.target.value)}/>
              <div 
                className={keyClass} 
                style={keyStyle}
                onClick={()=>{saveCurrentDeck()}}>
                  <FontAwesomeIcon icon={faSave}/>
              </div>            
            </div>
          </div>
          {spawnGroups?.map((groupInfo, _index) => {
            const groupId = groupInfo.id;
            return(
              <>
                <div 
                  className={"text-white pl-3 py-1 mt-2 cursor-pointer " + (currentGroupId === groupId ? "bg-red-800" : "bg-gray-800")}
                  onClick={() => setCurrentGroupId(groupId)}>
                  {groupInfo.label}
                </div>
                {currentDeck?.[groupId]?.map((cardInfo, _index) => {
                  return(
                    <div className="relative p-1 bg-yellow-800 text-white cursor-pointer"
                      onMouseMove={() => {setHoverCardDetails(cardInfo.cardDetails)}}
                      onMouseLeave={() => setHoverCardDetails(null)}>
                      <div 
                        className={keyClass} 
                        style={keyStyle}
                        onClick={()=>modifyDeckList(cardInfo.cardDetails, cardInfo.cardUuid, -cardInfo.quantity, cardInfo.name, groupId)}>
                          X
                      </div>
                      <div className="inline-block px-2 max-w-1/2">{cardInfo.name}</div>
                      <div className="absolute p-1 right-0 top-0">
                        <div 
                          className={keyClass} 
                          style={keyStyle}
                          onClick={()=>modifyDeckList(cardInfo.cardDetails, cardInfo.cardUuid, -1, cardInfo.name, groupId)}>
                            <FontAwesomeIcon icon={faChevronLeft}/>
                        </div>
                        <div className="inline-block px-2">{cardInfo.quantity}</div>
                        <div 
                          className={keyClass} 
                          style={keyStyle}
                          onClick={()=>modifyDeckList(cardInfo.cardDetails, cardInfo.cardUuid, 1, cardInfo.name, groupId)}>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )
          })}
        </div>
      </div>
      
      
      <div className="" style={{width:"60%"}}>
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
                  className="bg-gray-600 text-white cursor-pointer hover:bg-gray-500" 
                  onClick={() => {}}
                  onMouseEnter={() => {setHoverCardDetails(null);setHoverCardDetails(cardDetails)}}
                  onMouseLeave={() => setHoverCardDetails(null)}>
                  <td key={-1} className="p-1">
                    {deckbuilder.addButtons.map((addButtonVal, _index) => {
                      return(
                        <div 
                          className={keyClass} 
                          style={keyStyle}
                          onClick={()=>modifyDeckList(cardDetails, cardId, addButtonVal, sideA.name, currentGroupId)}>
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

      </ReactModal>
    )
})