import { useDispatch } from "react-redux";
import { useGameL10n } from "../../../hooks/useGameL10n";
import store from "../../../store";
import { setBrowseGroupId, setBrowseGroupTopN } from "../../store/playerUiSlice";
import { useDoActionList } from "./useDoActionList";
import { useGameDefinition } from "./useGameDefinition";
import { usePlayerN } from "./usePlayerN";

export const useBrowseTopN = () => {
    const gameDef = useGameDefinition();
    const doActionList = useDoActionList();
    const dispatch = useDispatch();
    const playerN = usePlayerN();
    const l10n = useGameL10n();
    return (groupId, topNstr) => {    
      const state = store.getState();
      const group = state?.gameUi?.game?.groupById?.[groupId];
      const stackIds = group["stackIds"];
      const numStacks = stackIds.length;
      const groupName = l10n(gameDef.groups[groupId].labelId);
      var peekStackIds = [];
      var topNint = 0;
      // Set peeking based on topNstr
      var visibility = true;
      var message = ""
      if (topNstr === "All") {
        topNint = numStacks;
        peekStackIds = stackIds;
        message = ["GAME_ADD_MESSAGE", "$PLAYER_N", " looked at ", groupName, "."];
      } else if (topNstr === "None") {
        topNint = numStacks; 
        peekStackIds = [];
        visibility = false;
        message = ["GAME_ADD_MESSAGE", "$PLAYER_N", " stopped looking at ", groupName, "."];
      } else {
        topNint = parseInt(topNstr) || 0;
        peekStackIds = stackIds.slice(0, topNint);
        message = ["GAME_ADD_MESSAGE", "$PLAYER_N", " looked at the top ", topNstr, " cards of ", groupName, "."]
      }
      dispatch(setBrowseGroupId(group.id));
      dispatch(setBrowseGroupTopN(topNstr));
      const actionList = [
        ["FOR_EACH_START_STOP_STEP", "$i", 0, topNint, 1,
          [
            ["DEFINE", "$STACK_ID", `$GROUP_BY_ID.${group.id}.stackIds.[$i]`],
            ["DEFINE", "$CARD_ID", "$STACK_BY_ID.$STACK_ID.cardIds.[0]"],
            ["GAME_SET_VAL", "/cardById/$CARD_ID/peeking/" + playerN, true]
          ]
        ],
        message
      ];
      doActionList(actionList);
    }
}