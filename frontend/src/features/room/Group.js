import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Stacks } from "./Stacks";
import { GROUPSINFO } from "./Constants";
import { faBars, faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleBrowseTopN } from "./HandleBrowseTopN"; 
import store from "../../store";
import { setDropdownMenuObj } from "./playerUiSlice";

export const Group = React.memo(({
  groupId,
  gameBroadcast,
  chatBroadcast,
  hideTitle,
  registerDivToArrowsContext
}) => {
  console.log("Rendering Group ",groupId);
  const dispatch = useDispatch();
  const group = useSelector(state => state?.gameUi?.game?.groupById?.[groupId]);
  const playerN = useSelector(state => state?.playerUi?.playerN);

  const handleEyeClick = (event) => {
    event.stopPropagation();
    handleBrowseTopN("All", group, gameBroadcast, chatBroadcast, dispatch);
  }

  const handleMainQuestClick = (event) => {
    event.stopPropagation();
    const state = store.getState();
    const questDeckGroup = state.gameUi.game.groupById["sharedQuestDeck"];
    handleBrowseTopN("All", questDeckGroup, gameBroadcast, chatBroadcast, dispatch);
  }

  const handleBarsClick = (event) => {
    event.stopPropagation();
    if (!playerN) return;
    const dropdownMenuObj = {
        type: "group",
        group: group,
        title: GROUPSINFO[groupId].name,
    }
    console.log("dispatch setDropdownMenuObj", dropdownMenuObj)
    if (playerN) dispatch(setDropdownMenuObj(dropdownMenuObj));
  }

  if (!group) return null;
  const numStacks = group.stackIds.length;
  const tablename = GROUPSINFO[group.id].tablename;
  return(
    <div className="h-full w-full">
      {hideTitle ? null :
        <div
          className="relative h-full float-left select-none text-gray-500"
          style={{width:"17px"}}>
          {group.type === "play" ?        
            <span 
              className="absolute mt-1" 
              style={{fontSize: "1.7vh", top: tablename == "Encounter" ? "55%" : "50%", left: "50%", transform: `translate(-50%, -40%) rotate(90deg)`, whiteSpace: "nowrap"}}>
              {playerN && groupId === "sharedMainQuest" && <FontAwesomeIcon onClick={(event) => handleMainQuestClick(event)}  className="hover:text-white mr-2" style={{transform: `rotate(-90deg)`}} icon={faEye}/>}
                {tablename}
            </span>
          :
            <div className="relative w-full h-full">
              <span 
                className="absolute mt-1" 
                style={{fontSize: "1.7vh", top: tablename == "Encounter" ? "55%" : "50%", left: "50%", transform: `translate(-50%, -40%) rotate(90deg)`, whiteSpace: "nowrap"}}>
                {(playerN || group.type === "discard") && <FontAwesomeIcon onClick={(event) => handleEyeClick(event)}  className="hover:text-white mr-2" style={{transform: `rotate(-90deg)`}} icon={faEye}/>}
                {playerN && <FontAwesomeIcon onClick={(event) => handleBarsClick(event)}  className="hover:text-white mr-2" style={{transform: `rotate(-90deg)`}} icon={faBars}/>}
                  {tablename + (group.type === "deck" ? " ("+numStacks+")" : "")}
              </span>
            </div>
          }
        </div>
      }
      <Stacks
        gameBroadcast={gameBroadcast}
        chatBroadcast={chatBroadcast}
        groupId={group.id}
        groupType={group.type}
        selectedStackIndices={[...Array(numStacks).keys()]}
        registerDivToArrowsContext={registerDivToArrowsContext}
      />
    </div>
  )
})