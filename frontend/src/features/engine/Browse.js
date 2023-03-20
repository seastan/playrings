import React, { useContext, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Stacks } from "./Stacks";
import { useBrowseTopN } from "./functions/useBrowseTopN";
import { getParentCardsInGroup } from "../plugins/lotrlcg/functions/helpers";
import { setValues } from "../store/gameUiSlice";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setBrowseGroupId, setDropdownMenuObj, setTyping } from "../store/playerUiSlice";
import { useGameL10n } from "../../hooks/useGameL10n";
import BroadcastContext from "../../contexts/BroadcastContext";
import { useGameDefinition } from "./functions/useGameDefinition";

const isNormalInteger = (str) => {
  var n = Math.floor(Number(str));
  return n !== Infinity && String(n) === str && n >= 0;
}

export const Browse = React.memo(({}) => {
  const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
  const dispatch = useDispatch();
  const l10n = useGameL10n();
  const gameDef = useGameDefinition();
  const playerN = useSelector(state => state?.playerUi?.playerN);
  const groupId = useSelector(state => state?.playerUi?.browseGroup?.id);
  const browseGroupTopN = useSelector(state => state?.playerUi?.browseGroup?.topN);
  const group = useSelector(state => state?.gameUi?.game?.groupById?.[groupId]);
  var region = useSelector(state => state?.gameUi?.game?.layout?.browse);
  const browseWidth = region.width;
  const regionWidthInt = parseInt(browseWidth.substring(0, browseWidth.length - 1))
  region = {...region, groupId: groupId, width: `${regionWidthInt*0.7}%`}
  
  const regionType = region.type;
  const game = useSelector(state => state?.gameUi?.game);
  const parentCards = getParentCardsInGroup(game, groupId);
  const [selectedCardType, setSelectedCardType] = useState('All');
  const [selectedCardName, setSelectedCardName] = useState('');
  const stackIds = group?.["stackIds"] || [];
  const numStacks = stackIds.length;
  const browseTopN = useBrowseTopN();

  if (!group) return;
  console.log("Rendering Browse", groupId, region)

  const handleBarsClick = (event) => {
    event.stopPropagation();
    const dropdownMenuObj = {
        type: "group",
        group: group,
        title: gameDef.groups[groupId].name
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
    const updates = [["cardById",cardId0,"peeking",playerN,false]]
    dispatch(setValues({updates: updates})) 
  }

  const handleCloseClick = (option) => {
    chatBroadcast("game_update",{message: "closed "+gameDef.groups[groupId].name+"."})
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
    chatBroadcast("game_update",{message: "shuffled "+gameDef.groups[groupId].name+"."})
    if (regionType === "pile") stopPeekingTopCard();
  }

  const closeAndOrder = () => {
    gameBroadcast("game_action", {action: "peek_at", options: {stack_ids: stackIds, value: false}})
    if (regionType === "pile") stopPeekingTopCard();
  }

  const closeAndPeeking = () => {
    chatBroadcast("game_update",{message: "is still peeking at "+gameDef.groups[groupId].name+"."})
  }

  const handleSelectClick = (event) => {
    const topNstr = event.target.value;
    browseTopN(group.id, topNstr)
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
    <div className="absolute bg-gray-700 w-full" style={{left: region.left, width: browseWidth, top: region.top, height: region.height, zIndex: 1e6}}>
      <strong className="absolute bg-gray-600 w-full text-gray-300 flex justify-center items-center" style={{top:"-20px", height: "20px"}}>
        <FontAwesomeIcon onClick={(event) => handleBarsClick(event)}  className="cursor-pointer hover:text-white" icon={faBars}/>
        <span className="px-2">{l10n(gameDef.groups[group.id].name)}</span>
      </strong>
      {/* <div
        className="absolute text-center h-full text-gray-500 float-left select-none"
        style={{width:"5vh"}}>
        <div>
          {group.type !== "play" && <FontAwesomeIcon onClick={(event) => handleBarsClick(event)}  className="hover:text-white" icon={faBars}/>}
          <span 
            className="absolute mt-1" 
            style={{top: "50%", left: "50%", transform: `translate(-50%, 0%) rotate(90deg)`, whiteSpace: "nowrap"}}>
              {l10n(gameDef.groups[group.id].tablename)}
          </span>
        </div>
      </div>  */}

      <div className="h-full float-left " style={{width: "75%"}}>
        <Stacks
          gameBroadcast={gameBroadcast}
          chatBroadcast={chatBroadcast}
          groupId={groupId}
          region={region}
          selectedStackIndices={filteredStackIndices}
        />
      </div>
 
      <div className="absolute h-full p-2 select-none" style={{left:"70%", width:"20%"}}>
            
        <div className="h-1/5 w-full">
          <div className="h-full float-left w-1/2 px-0.5">
            <select 
              name="numFaceup" 
              id="numFaceup"
              className="form-control w-full bg-gray-900 text-white border-0 h-full px-1 py-0"
              onChange={handleSelectClick}>
              <option value="" disabled selected>{l10n("Turn faceup...")}</option>
              <option value="None">{l10n("None")}</option>
              <option value="All">{l10n("All")}</option>
              <option value="5">{l10n("Top 5")}</option>
              <option value="10">{l10n("Top 10")}</option>
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
                      {l10n(row[itemIndex])}
                    </div>
                  </div>
                )
              })}
          </div>
          )})
        }
      </div>

      <div className="absolute h-full float-left p-3 select-none" style={{left: "90%", width: "10%"}}>
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
                    {l10n(row[0])}
                  </div>
                </div>
              </div>
            )})
          }
      </div>
    </div>
  )
})
