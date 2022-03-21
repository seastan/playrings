import React from "react";
import { Group } from "../engine/Group";

export const PlayerBar = React.memo(({
  gameBroadcast,
  chatBroadcast,
}) => {
  const observingPlayerN = useSelector(state => state?.playerUi?.observingPlayerN);
  if (!observingPlayerN) return null;
  return (
    <div className="h-full w-full">
      <Group
        groupId={observingPlayerN+'Hand'} 
        width="80%"
        gameBroadcast={gameBroadcast} 
        chatBroadcast={chatBroadcast}
      ></Group>
      <Group
        groupId={observingPlayerN+'Deck'} 
        width="10%"
        gameBroadcast={gameBroadcast} 
        chatBroadcast={chatBroadcast}
      ></Group>
      <Group
        groupId={observingPlayerN+'Discard'} 
        width="10%"
        gameBroadcast={gameBroadcast} 
        chatBroadcast={chatBroadcast}
      ></Group>
    </div>
  )
})