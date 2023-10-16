import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Stacks } from "./Stacks";
import { faBars, faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useBrowseTopN } from "./hooks/useBrowseTopN"; 
import { setDropdownMenu } from "../store/playerUiSlice";
import { useGameL10n } from "./hooks/useGameL10n";
import { useGameDefinition } from "./hooks/useGameDefinition";
import { useDoActionList } from "./hooks/useDoActionList";

export const Group = React.memo(({
  groupId,
  region
}) => {
  console.log("Rendering Group ",groupId);
  const dispatch = useDispatch();
  const gameL10n = useGameL10n();
  const gameDef = useGameDefinition();
  const group = useSelector(state => state?.gameUi?.game?.groupById?.[groupId]);
  const playerN = useSelector(state => state?.playerUi?.playerN);
  const browseTopN = useBrowseTopN();
  const doActionList = useDoActionList();
  // Print a warning to the console if the group is not found
  if (!group) {
    doActionList(["LOG", "Error: Tried to display an unknown group: ", groupId]);
    return null;
  }

  const handleEyeClick = (event) => {
    event.stopPropagation();
    browseTopN(groupId, "All");
  }

  const handleBarsClick = (event) => {
    event.stopPropagation();
    if (!playerN) return;
    const dropdownMenu = {
        type: "group",
        group: group,
        title: gameL10n(group.label),
    }
    console.log("dispatch setDropdownMenu", dropdownMenu)
    if (playerN) dispatch(setDropdownMenu(dropdownMenu));
  }

  if (!group) return null;
  const numStacks = group.stackIds.length;
  const tablename = gameL10n(gameDef.groups[group.id].tableLabel);
  return(
    <div className="h-full w-full">
      
        <div
          className="relative h-full float-left select-none text-gray-400"
          style={{width:"17px"}}>
            <div className="relative w-full h-full">
            {region.hideTitle ? null :
              <span 
                className="absolute mt-1 px-1 overflow-hidden rounded bg-gray-600-70" 
                style={{fontSize: "1.5vh", top: "50%", left: "50%", transform: `translate(-50%, -70%) rotate(90deg)`, whiteSpace: "nowrap"}}>
                  {gameL10n(tablename) + (region.type === "pile" ? " ("+numStacks+")" : "")}
              </span>
            }
            </div>
        </div>
        <div className="absolute text-gray-300 w-full flex items-center justify-center mt-2" style={{zIndex: 2e3}}>
          <div className="rounded bg-gray-600-70">
            {playerN && <FontAwesomeIcon onClick={(event) => handleEyeClick(event)}  className="hover:text-white mx-2" icon={faEye}/>}
            {playerN && <FontAwesomeIcon onClick={(event) => handleBarsClick(event)}  className="hover:text-white mx-2" icon={faBars}/>}
          </div>
        </div>
      <Stacks
        groupId={group.id}
        region={region}
        selectedStackIndices={[...Array(numStacks).keys()]}
      />
    </div>
  )
})