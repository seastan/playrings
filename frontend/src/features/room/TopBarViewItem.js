import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { GROUPSINFO } from "./Constants";
import { setBrowseGroupId, setBrowseGroupTopN } from "./roomUiSlice";

export const TopBarViewItem = React.memo(({
  groupId,
}) => {
  const dispatch = useDispatch();
  const group = useSelector(state => state?.gameUi?.game?.groupById[groupId]);
  const playerN = useSelector(state => state?.roomUi?.playerN);

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
  const deckType = group.type;

  if (deckType === "play") return;

  return(
    <li className="relative cursor-pointer" onClick={() => handleMenuClick({action:"look_at",groupId:groupId})} key={groupId}>
    <a className="absolute" href="#">
    {GROUPSINFO[groupId].name}
    </a>
    <div className="absolute right-2 top-1 select-none">{stackIds.length}</div>
    </li>
  )
})