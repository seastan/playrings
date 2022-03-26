import React from "react";
import { Group } from "../engine/Group";

export const PlayerBar = React.memo(({}) => {
  const observingPlayerN = useSelector(state => state?.playerUi?.observingPlayerN);
  if (!observingPlayerN) return null;
  return (
    <div className="h-full w-full">
      <Group
        groupId={observingPlayerN+'Hand'} 
        width="80%"
      ></Group>
      <Group
        groupId={observingPlayerN+'Deck'} 
        width="10%"
      ></Group>
      <Group
        groupId={observingPlayerN+'Discard'} 
        width="10%"
      ></Group>
    </div>
  )
})