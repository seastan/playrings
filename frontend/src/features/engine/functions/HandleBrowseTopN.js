import { GROUPSINFO } from "../../plugin/Constants";
import { setBrowseGroupId, setBrowseGroupTopN } from "../../store/playerUiSlice";

export const handleBrowseTopN = (
    topNstr, 
    group,
    gameBroadcast, 
    chatBroadcast,
    dispatch,
) => {
    const stackIds = group["stackIds"];
    const numStacks = stackIds.length;
    const groupName = GROUPSINFO[group.id].name;
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