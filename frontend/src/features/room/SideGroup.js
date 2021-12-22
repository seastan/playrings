import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { Stacks } from "./Stacks";
import { GROUPSINFO, CARDSCALE, LAYOUTINFO } from "./Constants";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { useSetDropdownMenu } from "../../contexts/DropdownMenuContext";
import { faBars, faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleBrowseTopN } from "./HandleBrowseTopN"; 

export const SideGroup = React.memo(({
  gameBroadcast,
  chatBroadcast,
  playerN,
  browseGroupId,
  registerDivToArrowsContext,
  cardSizeFactor,
  sideGroupId,
  setBrowseGroupId,
  setBrowseGroupTopN,
}) => {
  console.log("Rendering TableLayout");
  const numPlayersStore = state => state.gameUi.game.numPlayers;
  const numPlayers = useSelector(numPlayersStore);
  const storeGroup = state => state?.gameUi?.game?.groupById?.[sideGroupId];
  const group = useSelector(storeGroup);
  const layoutStore = state => state.gameUi?.game?.layout;
  const layout = useSelector(layoutStore);
  const { height, width } = useWindowDimensions();
  const aspectRatio = width/height;
  const setDropdownMenu = useSetDropdownMenu();

  const layoutInfo = LAYOUTINFO["layout" + numPlayers + layout];
  const numRows = layoutInfo.length;
  var cardSize = CARDSCALE/numRows;
  if (aspectRatio < 1.9) cardSize = cardSize*(1-0.75*(1.9-aspectRatio));

  cardSize = cardSize*cardSizeFactor/100;

  var middleRowsWidth = 100;
  if (sideGroupId !== "") {
    if (numRows >= 6) middleRowsWidth = 93;
    else middleRowsWidth = 91;
  }

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
        title: GROUPSINFO[sideGroupId].name,
        setBrowseGroupId: setBrowseGroupId,
        setBrowseGroupTopN: setBrowseGroupTopN,
    }
    if (playerN) setDropdownMenu(dropdownMenu);
  }

  return (
      Object.keys(GROUPSINFO).includes(sideGroupId) && browseGroupId !== sideGroupId &&
        <div className="relative float-left" style={{height: `${100-2*(100/numRows)}%`, width:`${100-middleRowsWidth}%`}}>
          <div className="absolute text-center w-full select-none text-gray-500">
            <div className="mt-1">
              {GROUPSINFO[sideGroupId].tablename}
            </div>
            {(playerN || group.type === "discard") && <FontAwesomeIcon onClick={(event) => handleEyeClick(event)}  className="hover:text-white mr-2" icon={faEye}/>}
            {playerN && <FontAwesomeIcon onClick={(event) => handleBarsClick(event)}  className="hover:text-white mr-2" icon={faBars}/>}
          </div>
          <div className="w-full h-full mt-12">
            <Stacks
              gameBroadcast={gameBroadcast}
              chatBroadcast={chatBroadcast}
              playerN={playerN}
              groupId={sideGroupId}
              groupType={"vertical"}
              cardSize={cardSize}
              registerDivToArrowsContext={registerDivToArrowsContext}
            />
          </div>
        </div>
      
  )
})
