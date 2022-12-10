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
import { DeckbuilderTable } from "./DeckbuilderTable";
import { DeckbuilderCurrent } from "./DeckbuilderCurrent";
import { DeckbuilderMyDecks } from "./DeckbuilderMyDecks";

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
      
      <DeckbuilderMyDecks
        doFetchHash={doFetchHash}
        myDecks={myDecks}
        currentDeck={currentDeck}
        setCurrentDeck={setCurrentDeck}/>
      
      {currentDeck?.id && 
        <DeckbuilderCurrent
          modifyDeckList={modifyDeckList}
          setNumChanges={setNumChanges}
          doFetchHash={doFetchHash}
          setHoverCardDetails={setHoverCardDetails}
          currentDeck={currentDeck}
          setCurrentDeck={setCurrentDeck}/>
      }

      {currentDeck.id && 
        <DeckbuilderTable
          currentGroupId={currentGroupId}
          modifyDeckList={modifyDeckList}
          setHoverCardDetails={setHoverCardDetails}/>
      }

      </div>
      </ReactModal>
    )
})