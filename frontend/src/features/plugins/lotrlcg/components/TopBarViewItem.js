import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { GROUPSINFO } from "../definitions/constants";
import { setBrowseGroupId, setBrowseGroupTopN } from "../../../store/playerUiSlice";
import { useGameL10n } from "../../../../hooks/useGameL10n";
import "./TopBarViewItem.css"

export const TopBarViewItem = React.memo(({
  groupId,
}) => {
  const dispatch = useDispatch();
  const l10n = useGameL10n();
  const group = useSelector(state => state?.gameUi?.game?.groupById[groupId]);
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
  const deckType = group.type;

  if (deckType === "play") return;

  return(
    <li className="relative cursor-pointer top-bar-item-with-count" onClick={() => handleMenuClick({action:"look_at",groupId:groupId})} key={groupId}>
      <a href="#">
        {l10n(GROUPSINFO[groupId].name)}
      </a>
      <div className="select-none">
        {stackIds.length}
      </div>
    </li>
  )
})