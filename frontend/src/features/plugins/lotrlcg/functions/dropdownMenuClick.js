import { GROUPSINFO } from "../definitions/constants";
import { useBrowseTopN } from "../../../engine/functions/useBrowseTopN";
import { useSelector } from "react-redux";
import { useDoActionList } from "../../../engine/functions/useDoActionList";


// dropdownMenu is an object that gets populated with infor about a card when a card is pressed, or about a group when a group is pressed.

export const useDropdownClickCommon = (dropdownOptions) => {
  const dropdownClickCard = useDropdownClickCard;
  const dropdownClickGroup = useDropdownClickGroup;
  const dropdownClickFirstPlayer = useDropdownClickFirstPlayer;
  const type = useSelector(state => state?.playerUi?.dropdownMenu?.type);
  if (type === "card") dropdownClickCard(dropdownOptions);
  else if (type === "group") dropdownClickGroup(dropdownOptions);
  else if (type === "firstPlayer") dropdownClickFirstPlayer(dropdownOptions);
}

export const useDropdownClickCard = (dropdownOptions) => {
  const doActionList = useDoActionList();
  doActionList(dropdownOptions.action);
}

export const useDropdownClickGroup = (dropdownOptions, actionProps) => {
  const {state, dispatch, gameBroadcast, chatBroadcast} = actionProps;
  const gameUi = state.gameUi;
  const game = gameUi.game;
  const dropdownMenu = state.playerUi.dropdownMenu;
  const playerN = state.playerUi.playerN;
  const group = dropdownMenu.group;
  const browseTopN = useBrowseTopN;
  if (dropdownOptions.action === "shuffle") {
    gameBroadcast("game_action", {action: "shuffle_group", options: {group_id: group.id}})
    chatBroadcast("game_update",{message: "shuffled "+GROUPSINFO[group.id].name+"."})
  } else if (dropdownOptions.action === "makeVisible") {
    const isVisible = game.playerData[playerN].visibleHand; 
    // Make it so future cards added to hand will be visible
    gameBroadcast("game_action", {action: "update_values", options: {updates: [["playerData", playerN, "visibleHand", !isVisible]]}})
    // Make it so all cards currently in hand are visible
    Object.keys(game.playerData).forEach(playerI => {
      if (playerI !== playerN) gameBroadcast("game_action", {action: "peek_at", options: {stack_ids: game.groupById[playerN+"Hand"].stackIds, for_player_n: playerI, value: !isVisible}})  
    });
    if (isVisible) chatBroadcast("game_update",{message: "made their hand hidden."})
    else chatBroadcast("game_update",{message: "made their hand visible."})
  } else if (dropdownOptions.action === "chooseRandom") {
    const stackIds = group.stackIds;
    const rand = Math.floor(Math.random() * stackIds.length);
    const randStackId = stackIds[rand];
    gameBroadcast("game_action", {action: "target_stack", options: {stack_id: randStackId}})
    chatBroadcast("game_update",{message: "randomly picked a card in "+GROUPSINFO[group.id].name+"."})
  } else if (dropdownOptions.action === "moveStacks") {
    gameBroadcast("game_action", {action: "move_stacks", options: {orig_group_id: group.id, dest_group_id: dropdownOptions.destGroupId, top_n: group.stackIds.length,  position: dropdownOptions.position}})
    if (dropdownOptions.position === "top") {
      chatBroadcast("game_update",{message: "moved "+GROUPSINFO[group.id].name+" to top of "+GROUPSINFO[dropdownOptions.destGroupId].name+"."})
    } else if (dropdownOptions.position === "bottom") {
      chatBroadcast("game_update",{message: "moved "+GROUPSINFO[group.id].name+" to bottom of "+GROUPSINFO[dropdownOptions.destGroupId].name+"."})
    } else if (dropdownOptions.position === "shuffle") {
      chatBroadcast("game_update",{message: "shuffled "+GROUPSINFO[group.id].name+" into "+GROUPSINFO[dropdownOptions.destGroupId].name+"."})
    }
  } else if (dropdownOptions.action === "lookAt") {
    const topNstr = dropdownOptions.topN === "X" ? prompt("Enter a number",0) : dropdownOptions.topN;
    browseTopN(
      topNstr, 
      group,
      gameBroadcast, 
      chatBroadcast,
      dispatch,
    ) 
  } else if (dropdownOptions.action === "dealX") {
    var topX = parseInt(prompt("Enter a number",0)) || 0;
    gameBroadcast("game_action", {action: "deal_x", options: {group_id: group.id, dest_group_id: playerN+"Play1", top_x: topX}});
  } else if (dropdownOptions.action === "discardUntil") {
    const stackIds = game.groupById["sharedEncounterDeck"].stackIds;
    for (var i=0; i<stackIds.length; i++) {
      const stackId = stackIds[i];
      const cardId = game.stackById[stackId].cardIds[0];
      const card = game.cardById[cardId];
      const cardType = card.sides.A.type;
      const cardName = card.sides.A.name;
      chatBroadcast("game_update",{message: "discarded "+cardName+" from "+GROUPSINFO["sharedEncounterDeck"].name+"."})
      if (cardType === dropdownOptions.cardType) {
        gameBroadcast("game_action", {action: "move_stacks", options: {orig_group_id: group.id, dest_group_id: "sharedEncounterDiscard", top_n: i+1,  position: "top"}})
        gameBroadcast("game_action", {action: "move_stacks", options: {orig_group_id: "sharedEncounterDiscard", dest_group_id: "sharedStaging", top_n: 1,  position: "bottom"}})
        chatBroadcast("game_update",{message: "moved "+cardName+" from "+GROUPSINFO["sharedEncounterDiscard"].name+" to "+GROUPSINFO["sharedStaging"].name+"."})
        break;
      }
      // If none were found by the end, move all cards
      if (i === stackIds.length - 1) gameBroadcast("game_action", {action: "move_stacks", options: {orig_group_id: group.id, dest_group_id: "sharedEncounterDiscard", top_n: stackIds.length,  position: "top"}})
    }
  }
}

export const useDropdownClickFirstPlayer = (dropdownOptions, actionProps) => {
  const {state, dispatch, gameBroadcast, chatBroadcast} = actionProps;
  
} 