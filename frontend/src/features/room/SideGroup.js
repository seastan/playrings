import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Stacks } from "./Stacks";
import { GROUPSINFO, LAYOUTINFO } from "./Constants";
import { faBars, faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleBrowseTopN } from "./HandleBrowseTopN"; 
import { setDropdownMenuObj } from "./roomUiSlice";

export const SideGroup = React.memo(({
  gameBroadcast,
  chatBroadcast,
  registerDivToArrowsContext,
}) => {
  console.log("Rendering TableLayout");
  const dispatch = useDispatch();
  const numPlayers = useSelector(state => state?.gameUi?.game?.numPlayers);
  const sideGroupId = useSelector(state => state?.roomUi?.sideGroupId);
  const browseGroupId = useSelector(state => state?.roomUi?.browseGroup?.id);
  const group = useSelector(state => state?.gameUi?.game?.groupById?.[sideGroupId]);
  const layout = useSelector(state => state.gameUi?.game?.layout);    
  const playerN = useSelector(state => state?.roomUi?.playerN)

  const layoutInfo = LAYOUTINFO["layout" + numPlayers + layout];
  const numRows = layoutInfo.length;

  var middleRowsWidth = 100;
  if (sideGroupId !== "") {
    if (numRows >= 6) middleRowsWidth = 93;
    else middleRowsWidth = 91;
  }

  const handleEyeClick = (event) => {
    event.stopPropagation();
    handleBrowseTopN("All", group, gameBroadcast, chatBroadcast, dispatch);
  }

  const handleBarsClick = (event) => {
    event.stopPropagation();
    if (!playerN) return;
    const dropdownMenuObj = {
        type: "group",
        group: group,
        title: GROUPSINFO[sideGroupId].name,
    }
    if (playerN) dispatch(setDropdownMenuObj(dropdownMenuObj));
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
              groupId={sideGroupId}
              groupType={"vertical"}
              registerDivToArrowsContext={registerDivToArrowsContext}
            />
          </div>
        </div>
      
  )
})
