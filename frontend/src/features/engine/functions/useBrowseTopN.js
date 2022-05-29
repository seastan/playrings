import React, { useContext } from "react";
import { useDispatch } from "react-redux";
import BroadcastContext from "../../../contexts/BroadcastContext";
import store from "../../../store";
import { setBrowseGroupId, setBrowseGroupTopN } from "../../store/playerUiSlice";
import { useGameDefinition } from "./useGameDefinition";

export const useBrowseTopN = () => {
    const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
    const gameDef = useGameDefinition();
    const dispatch = useDispatch();
    return (groupId, topNstr) => {    
      const state = store.getState();
      const group = state?.gameUi?.game?.groupById?.[groupId];
      const stackIds = group["stackIds"];
      const numStacks = stackIds.length;
      const groupName = gameDef.groups[groupId].name;
      var peekStackIds = [];
      var topNint = 0;
      // Set peeking based on topNstr
      if (topNstr === "All") {
        topNint = numStacks;
        peekStackIds = stackIds;
        chatBroadcast("game_update",{message: "looks at "+groupName+"."})
      } else if (topNstr === "None") {
        topNint = numStacks; 
        peekStackIds = [];
        chatBroadcast("game_update",{message: "stopped looking at "+groupName+"."})
      } else {
        topNint = parseInt(topNstr) || 0;
        peekStackIds = stackIds.slice(0, topNint);
        chatBroadcast("game_update",{message: "looks at top "+topNstr+" of "+groupName+"."})
      }
      dispatch(setBrowseGroupId(group.id));
      dispatch(setBrowseGroupTopN(topNstr));
      gameBroadcast("game_action", {action: "peek_at", options: {stack_ids: stackIds, value: false}})
      gameBroadcast("game_action", {action: "peek_at", options: {stack_ids: peekStackIds, value: true}})
    }
}