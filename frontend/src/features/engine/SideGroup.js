import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Stacks } from "./Stacks";
import { faBars, faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useBrowseTopN } from "./functions/useBrowseTopN"; 
import { setDropdownMenu } from "../store/playerUiSlice";
import { useGameL10n } from "../../hooks/useGameL10n";
import { useGameDefinition } from "./functions/useGameDefinition";
import { useLayout } from "./functions/useLayout";

export const SideGroup = React.memo(({
  registerDivToArrowsContext,
}) => {
  console.log("Rendering TableLayout");
  const dispatch = useDispatch();
  const l10n = useGameL10n();
  const gameDef = useGameDefinition();
  const sideGroupId = useSelector(state => state?.playerUi?.sideGroupId);
  const browseGroupId = useSelector(state => state?.playerUi?.browseGroup?.id);
  const group = useSelector(state => state?.gameUi?.game?.groupById?.[sideGroupId]);
  const layout = useLayout();
  const playerN = useSelector(state => state?.playerUi?.playerN);
  const browseTopN = useBrowseTopN();

  const numRows = layout.length;

  var middleRowsWidth = 100;
  if (sideGroupId !== "") {
    if (numRows >= 6) middleRowsWidth = 93;
    else middleRowsWidth = 91;
  }

  const handleEyeClick = (event) => {
    event.stopPropagation();
    browseTopN(group.id, "All");
  }

  const handleBarsClick = (event) => {
    event.stopPropagation();
    if (!playerN) return;
    const dropdownMenu = {
        type: "group",
        group: group,
        title: gameDef.groups[sideGroupId].name,
    }
    if (playerN) dispatch(setDropdownMenu(dropdownMenu));
  }

  return (
    Object.keys(gameDef.groups).includes(sideGroupId) && browseGroupId !== sideGroupId &&
      <div className="relative float-left" style={{height: `${100-2*(100/numRows)}%`, width:`${100-middleRowsWidth}%`}}>
        <div className="absolute text-center w-full select-none text-gray-500">
          <div className="mt-1">
            {l10n(gameDef.groups[sideGroupId].tableName)}
          </div>
          {(playerN || group.type === "discard") && <FontAwesomeIcon onClick={(event) => handleEyeClick(event)}  className="hover:text-white mr-2" icon={faEye}/>}
          {playerN && <FontAwesomeIcon onClick={(event) => handleBarsClick(event)}  className="hover:text-white mr-2" icon={faBars}/>}
        </div>
        <div className="w-full h-full mt-12">
          <Stacks
            groupId={sideGroupId}
            layoutType={"vertical"}
            registerDivToArrowsContext={registerDivToArrowsContext}
          />
        </div>
      </div>
  )
})
