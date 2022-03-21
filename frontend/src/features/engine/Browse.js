import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Stacks } from "./Stacks";
import { GROUPSINFO } from "../plugin/Constants";
import { handleBrowseTopN } from "./functions/HandleBrowseTopN";
import { getParentCardsInGroup } from "../plugin/Helpers";
import { setValues } from "../store/gameUiSlice";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setBrowseGroupId, setDropdownMenuObj, setTyping } from "../store/playerUiSlice";

const isNormalInteger = (str) => {
  var n = Math.floor(Number(str));
  return n !== Infinity && String(n) === str && n >= 0;
}

export const Browse = React.memo(({
  gameBroadcast,
  chatBroadcast,
}) => {
  const dispatch = useDispatch();
  const playerN = useSelector(state => state?.playerUi?.playerN);
  const groupId = useSelector(state => state?.playerUi?.browseGroup?.id);
  const browseGroupTopN = useSelector(state => state?.playerUi?.browseGroup?.topN);
  const group = useSelector(state => state?.gameUi?.game?.groupById?.[groupId]);
  const groupType = group["type"];
  const game = useSelector(state => state?.gameUi?.game);
  const parentCards = getParentCardsInGroup(game, groupId);
  const [selectedCardType, setSelectedCardType] = useState('All');
  const [selectedCardName, setSelectedCardName] = useState('');
  const stackIds = group["stackIds"];
  const numStacks = stackIds.length;

  const handleBarsClick = (event) => {
    event.stopPropagation();
    const dropdownMenuObj = {
        type: "group",
        group: group,
        title: GROUPSINFO[groupId].name
    }
    dispatch(setDropdownMenuObj(dropdownMenuObj));
  }

  // This allows the deck to be hidden instantly upon close (by hiding the top card)
  // rather than waiting to the update from the server
  const stopPeekingTopCard = () => {
    if (numStacks === 0) return null;
    const stackId0 = stackIds[0];
    const cardIds = game["stackById"][stackId0]["cardIds"];
    const cardId0 = cardIds[0];
    const updates = [["game","cardById",cardId0,"peeking",playerN,false]]
    dispatch(setValues({updates: updates})) 
  }

  const handleCloseClick = (option) => {
    chatBroadcast("game_update",{message: "closed "+GROUPSINFO[groupId].name+"."})
    if (playerN) {
      if (option === "shuffle") closeAndShuffle();
      else if (option === "order") closeAndOrder();
      else if (option === "peeking") closeAndPeeking();
    }
    dispatch(setBrowseGroupId(null));
  }

  const closeAndShuffle = () => {
    gameBroadcast("game_action", {action: "peek_at", options: {stack_ids: stackIds, value: false}})
    gameBroadcast("game_action", {action: "shuffle_group", options: {group_id: groupId}})
    chatBroadcast("game_update",{message: "shuffled "+GROUPSINFO[groupId].name+"."})
    if (groupType === "deck") stopPeekingTopCard();
  }

  const closeAndOrder = () => {
    gameBroadcast("game_action", {action: "peek_at", options: {stack_ids: stackIds, value: false}})
    if (groupType === "deck") stopPeekingTopCard();
  }

  const closeAndPeeking = () => {
    chatBroadcast("game_update",{message: "is still peeking at "+GROUPSINFO[groupId].name+"."})
  }

  const handleSelectClick = (event) => {
    const topNstr = event.target.value;
    handleBrowseTopN(
      topNstr, 
      group,
      gameBroadcast, 
      chatBroadcast,
      dispatch,
    )
  }

  const handleInputTyping = (event) => {
    setSelectedCardName(event.target.value);
  }

  // If browseGroupTopN not set, or equal to "All" or "None", show all stacks
  var browseGroupTopNint = isNormalInteger(browseGroupTopN) ? parseInt(browseGroupTopN) : numStacks;
  var filteredStackIndices = [...Array(browseGroupTopNint).keys()];
  // Filter by selected card type
  if (selectedCardType === "Other") 
      filteredStackIndices = filteredStackIndices.filter((s,i) => (
        stackIds[s] && 
        parentCards[s]["sides"]["A"]["type"] !== "Enemy" &&
        parentCards[s]["sides"]["A"]["type"] !== "Location" &&
        parentCards[s]["sides"]["A"]["type"] !== "Treachery" &&
        parentCards[s]["sides"]["A"]["type"] !== "Ally" &&
        parentCards[s]["sides"]["A"]["type"] !== "Attachment" &&
        parentCards[s]["sides"]["A"]["type"] !== "Event" &&
        (parentCards[s]["peeking"][playerN] || parentCards[s]["currentSide"] === "A") 
  ));
  else if (selectedCardType !== "All") 
    filteredStackIndices = filteredStackIndices.filter((s,i) => (
      stackIds[s] && 
      parentCards[s]["sides"]["A"]["type"] === selectedCardType &&
      (parentCards[s]["peeking"][playerN] || parentCards[s]["currentSide"] === "A") 
  ));  
  console.log(filteredStackIndices)
  // Filter by card name
  if (selectedCardName !== "")
    filteredStackIndices = filteredStackIndices.filter((s,i) => (
      stackIds[s] && 
      (
        parentCards[s]["sides"]["A"]["name"].toLowerCase().includes(selectedCardName.toLowerCase()) ||
        parentCards[s]["sides"]["A"]["keywords"].toLowerCase().includes(selectedCardName.toLowerCase()) ||
        parentCards[s]["sides"]["A"]["text"].toLowerCase().includes(selectedCardName.toLowerCase())
      ) &&
      (parentCards[s]["peeking"][playerN] || parentCards[s]["currentSide"] === "A")
    ));

  return(
    <div className="relative h-full w-full">
      <div
        className="relative text-center h-full text-gray-500 float-left select-none"
        style={{width:"5vh"}}>
        <div>
          {group.type !== "play" && <FontAwesomeIcon onClick={(event) => handleBarsClick(event)}  className="hover:text-white" icon={faBars}/>}
          <span 
            className="absolute mt-1" 
            style={{top: "50%", left: "50%", transform: `translate(-50%, 0%) rotate(90deg)`, whiteSpace: "nowrap"}}>
              {GROUPSINFO[group.id].tablename}
          </span>
        </div>
      </div> 

      <div className="relative h-full float-left " style={{width: "calc(100% - 60vh)"}}>
        <Stacks
          gameBroadcast={gameBroadcast}
          chatBroadcast={chatBroadcast}
          groupId={groupId}
          groupType={"hand"}
          selectedStackIndices={filteredStackIndices}
        />
      </div>

      <div className="relative h-full float-left p-2 select-none" style={{width:"35vh"}}>
            
        <div className="h-1/5 w-full">
          <div className="h-full float-left w-1/2 px-0.5">
            <select 
              name="numFaceup" 
              id="numFaceup"
              className="form-control w-full bg-gray-900 text-white border-0 h-full px-1 py-0"
              onChange={handleSelectClick}>
              <option value="" disabled selected>Turn faceup...</option>
              <option value="None">None</option>
              <option value="All">All</option>
              <option value="5">Top 5</option>
              <option value="10">Top 10</option>
            </select>
          </div>
          <div className="h-full float-left w-1/2 px-0.5">
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Search.."
              className="form-control w-full bg-gray-900 text-white border-0 h-full px-1"
              onFocus={event => dispatch(setTyping(true))}
              onBlur={event => dispatch(setTyping(false))}
              onChange={handleInputTyping}
            />
          </div>
        </div>
      
        {[["All", "Ally"],
          ["Enemy", "Attachment"],
          ["Location", "Event"],
          ["Treachery", "Other"],
        ].map((row, rowIndex) => {
          return(
            <div className="h-1/5 w-full text-white text-center">
              {row.map((item, itemIndex) => {
                return(
                  <div className="h-full float-left w-1/2 p-0.5">
                    <div className={"h-full w-full flex items-center justify-center hover:bg-gray-600 rounded" + (selectedCardType === item ? " bg-red-800" : " bg-gray-800")}
                      onClick={() => setSelectedCardType(item)}>    
                      {row[itemIndex]}
                    </div>
                  </div>
                )
              })}
          </div>
          )})
        }
      </div>

      <div className="relative h-full float-left p-3 select-none" style={{width:"20vh"}}>
        <div className="h-1/4 w-full text-white text-center">
          <div className="h-full float-left w-full p-0.5">
            <div className="h-full w-full">   
              Close &
            </div>
          </div>
        </div>
        {[["Shuffle", "shuffle"],
          ["Keep order", "order"],
          ["Keep peeking", "peeking"]
          ].map((row, rowIndex) => {
            if (!playerN && row[1] === "shuffle") return;
            if (!playerN && row[1] === "peeking") return; 
            return(
              <div className="h-1/4 w-full text-white text-center">
                <div className="h-full float-left w-full p-0.5">
                  <div className="flex h-full w-full bg-gray-800 hover:bg-gray-600 rounded items-center justify-center"
                    onClick={(event) => handleCloseClick(row[1])}>    
                    {row[0]}
                  </div>
                </div>
              </div>
            )})
          }
      </div>
    </div>
  )
})
