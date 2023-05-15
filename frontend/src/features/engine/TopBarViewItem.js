import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { setBrowseGroupId, setBrowseGroupTopN } from "../store/playerUiSlice";
import { useGameL10n } from "./hooks/useGameL10n";

export const TopBarViewItem = React.memo(({
  groupId,
}) => {
  const dispatch = useDispatch();
  const gameL10n = useGameL10n();
  const group = useSelector(state => state?.gameUi?.game?.groupById?.[groupId]);
  const playerN = useSelector(state => state?.playerUi?.playerN);

  const handleMenuClick = (data) => {
    if (!playerN) {
      alert("Please sit at the table first.");
      return;
    } else if (data.action === "look_at") {
      dispatch(setBrowseGroupId(data.groupId));
      dispatch(setBrowseGroupTopN("All"))
    } 
  }

  if (!group) return;

  const stackIds = group.stackIds;

  return(
    <li className="relative cursor-pointer" onClick={() => handleMenuClick({action:"look_at",groupId:groupId})} key={groupId}>
    <a className="absolute" href="#">
      {gameL10n(group.labelId)}
    </a>
    <div className="absolute right-2 top-1 select-none">{stackIds.length}</div>
    </li>
  )
})