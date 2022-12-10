import React, {useState} from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faUpload } from "@fortawesome/free-solid-svg-icons";
import useProfile from "../../hooks/useProfile";
import { useAuthOptions } from "../../hooks/useAuthOptions";
import axios from "axios";

const keyClass = "m-auto border cursor-pointer bg-gray-500 hover:bg-gray-400 text-center bottom inline-block";
const keyStyle = {width: "3vh", height: "3vh", borderRadius: "0.5vh"}

export const DeckbuilderMyDecks = React.memo(({doFetchHash, myDecks, currentDeck, setCurrentDeck}) => {
  const user = useProfile();
  const authOptions = useAuthOptions();
  const pluginId = useSelector(state => state?.gameUi?.game?.pluginId);
  const defaultName = "Untitled";

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

  return(   
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
    )
})