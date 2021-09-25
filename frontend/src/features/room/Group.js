import React from "react";
import { useSelector } from 'react-redux';
import { Stacks } from "./Stacks";
import { GROUPSINFO } from "./Constants";
import { faBars, faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ContextMenuTrigger } from "react-contextmenu";
import { GroupContextMenu } from "./GroupContextMenu";
import { useSetDropdownMenu } from "../../contexts/DropdownMenuContext";
import { handleBrowseTopN } from "./HandleBrowseTopN"; 
import useLongPress from "../../hooks/useLongPress";

export const Group = React.memo(({
  groupId,
  cardSize,
  gameBroadcast,
  chatBroadcast,
  playerN,
  hideTitle,
  browseGroupId,
  setBrowseGroupId,
  setBrowseGroupTopN,
  registerDivToArrowsContext
}) => {
  console.log("Rendering Group ",groupId);
  const storeGroup = state => state?.gameUi?.game?.groupById?.[groupId];
  const group = useSelector(storeGroup);
  const setDropdownMenu = useSetDropdownMenu();

  const handleEyeClick = (event) => {
    event.stopPropagation();
    handleBrowseTopN("All", group, playerN, gameBroadcast, chatBroadcast, setBrowseGroupId, setBrowseGroupTopN);
  }

  const handleBarsClick = (event) => {
    event.stopPropagation();
    if (!playerN) return;
    const dropdownMenu = {
        type: "group",
        group: group,
        title: GROUPSINFO[groupId].name,
        setBrowseGroupId: setBrowseGroupId,
        setBrowseGroupTopN: setBrowseGroupTopN,
    }
    if (playerN) setDropdownMenu(dropdownMenu);
  }

  if (!group) return null;
  const numStacks = group.stackIds.length;
  const tablename = GROUPSINFO[group.id].tablename;
  return(
    <div className="h-full w-full">
      {hideTitle ? null :
        <div
          className="relative h-full float-left select-none text-gray-500"
          style={{width:"15px"}}>
          {group.type === "play" ?        
            <div className="absolute pointer-events-none mt-1" 
            style={{top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(90deg)", whiteSpace: "nowrap"}}>
              {tablename}
            </div>
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
        playerN={playerN}
        groupId={group.id}
        groupType={group.type}
        cardSize={cardSize}
        selectedStackIndices={[...Array(numStacks).keys()]}
        registerDivToArrowsContext={registerDivToArrowsContext}
      />
    </div>
  )
})