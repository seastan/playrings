import { cardAction } from "./actions";
import { GROUPSINFO } from "../definitions/constants";
import { useBrowseTopN } from "../../../engine/functions/useBrowseTopN";
import { 
  getDisplayName, 
  getGroupIdStackIndexCardIndex,
  getCurrentFace,
  shuffle,
  getRandomIntInclusive,
} from "./helpers";
import { useDispatch, useSelector } from "react-redux";
import BroadcastContext from "../../../../contexts/BroadcastContext";
import { useContext } from "react";
import { useDoActionList } from "../../../engine/functions/useDoActionList";


// dropdownMenu is an object that gets populated with infor about a card when a card is pressed, or about a group when a group is pressed.

export const useDropdownClickCommon = (dropdownOptions) => {
  const dropdownClickCard = useDropdownClickCard;
  const dropdownClickGroup = useDropdownClickGroup;
  const dropdownClickFirstPlayer = useDropdownClickFirstPlayer;
  const type = useSelector(state => state?.playerUi?.dropdownMenuObj?.type);
  if (type === "card") dropdownClickCard(dropdownOptions);
  else if (type === "group") dropdownClickGroup(dropdownOptions);
  else if (type === "firstPlayer") dropdownClickFirstPlayer(dropdownOptions);
}

export const useDropdownClickCard = (dropdownOptions) => {
  // const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
  // const gameUi = useSelector(state => state?.gameUi);
  // const playerUi = useSelector(state => state?.playerUi);
  // const game = gameUi?.game;
  // const dropdownMenuObj = playerUi?.dropdownMenuObj;
  // const playerN = playerUi?.playerN;
  // const menuCard = dropdownMenuObj.card;
  // const displayName = getDisplayName(menuCard);
  const doActionList = useDoActionList();
  doActionList(dropdownOptions.action);
/*   console.log("dropdownClick")
  if (dropdownOptions.action === "toggle_rotate") {
    console.log("dropdownExhaust", menuCard)
    cardAction("toggle_rotate", menuCard?.id, null, actionProps);
  } else if (dropdownOptions.action === "flipCard") {
    alert("here")
    cardAction("flip", menuCard?.id, null, actionProps);
  } else if (dropdownOptions.action === "detach") {
    cardAction("detach", menuCard?.id, null, actionProps);
  } else if (dropdownOptions.action === "swap_side") {
    cardAction("swap_side", menuCard?.id, null, actionProps);
  } else if (dropdownOptions.action === "peek") {
    gameBroadcast("game_action", {action: "peek_card", options: {card_id: menuCard.id, value: true}})
    chatBroadcast("game_update", {message: "peeked at "+displayName+"."})
  } else if (dropdownOptions.action === "unpeek") {
    gameBroadcast("game_action", {action: "peek_card", options: {card_id: menuCard.id, value: false}})
    chatBroadcast("game_update", {message: " stopped peeking at "+displayName+"."})
  } else if (dropdownOptions.action === "lock") {
    gameBroadcast("game_action", {action: "update_values", options: {updates: [["cardById", menuCard.id, "locked", true]]}})
    chatBroadcast("game_update", {message: " locked "+displayName+"."})
  } else if (dropdownOptions.action === "delete") {
    gameBroadcast("game_action", {
      action: "action_on_matching_cards", 
      options: {
        criteria:[["id", menuCard?.id]], 
        action: "delete_card", 
        options: {}
      }
    });
    chatBroadcast("game_update", {message: " deleted "+displayName+"."})
  } else if (dropdownOptions.action === "unlock") {
    gameBroadcast("game_action", {action: "update_values", options: {updates: [["cardById", menuCard.id, "locked", false]]}})
    chatBroadcast("game_update", {message: " unlocked "+displayName+"."})
  } else if (dropdownOptions.action === "moveCard") {
    const destGroupTitle = GROUPSINFO[dropdownOptions.destGroupId].name;
    if (dropdownOptions.position === "top") {
      gameBroadcast("game_action", {action: "move_card", options: {card_id: menuCard.id, dest_group_id: dropdownOptions.destGroupId, dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}})
      chatBroadcast("game_update",{message: "moved "+displayName+" to top of "+destGroupTitle+"."})
    } else if (dropdownOptions.position === "bottom") {
      gameBroadcast("game_action", {action: "move_card", options: {card_id: menuCard.id, dest_group_id: dropdownOptions.destGroupId, dest_stack_index: -1, dest_card_index: 0, combine: false, preserve_state: false}})
      chatBroadcast("game_update", {message: "moved "+displayName+" to bottom of "+destGroupTitle+"."})
    } else if (dropdownOptions.position === "shuffle") {
      gameBroadcast("game_action", {action: "move_card", options: {card_id: menuCard.id, dest_group_id: dropdownOptions.destGroupId, dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}})
      gameBroadcast("game_action", {action: "shuffle_group", options: {group_id: dropdownOptions.destGroupId}})
      chatBroadcast("game_update", {message: "shuffled "+displayName+" into "+destGroupTitle+"."})
    } else if (dropdownOptions.position === "shuffle_into_top") {
      const num = parseInt(prompt("Shuffle into top...","5"));
      // Get stack Ids
      const stackIds = game.groupById[dropdownOptions.destGroupId].stackIds;
      if (num > stackIds.length) {
        alert("Not enough cards in destination group.")
        return;
      }
      const topX = stackIds.slice(0,num);
      //alert(topX)
      const topXShuffled = shuffle(topX);
      const newStackIds = topXShuffled.concat(stackIds.slice(num)); 
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["groupById", dropdownOptions.destGroupId, "stackIds", newStackIds]]}})
      // Select random number
      const newIndex = getRandomIntInclusive(0,num);
      // Move card in
      gameBroadcast("game_action", {action: "move_card", options: {card_id: menuCard.id, dest_group_id: dropdownOptions.destGroupId, dest_stack_index: newIndex, dest_card_index: 0, combine: false, preserve_state: false}})
      chatBroadcast("game_update", {message: "shuffled "+displayName+" into the top "+num+" of "+destGroupTitle+"."})
    } else if (dropdownOptions.position === "shuffle_into_bottom") {
      const num = parseInt(prompt("Shuffle into bottom...","10"));
      // Get stack Ids
      const stackIds = game.groupById[dropdownOptions.destGroupId].stackIds;
      const numStacks = stackIds.length;
      if (num > numStacks) {
        alert("Not enough cards in destination group.")
        return;
      }
      const bottomX = stackIds.slice(numStacks-num);
      const bottomXShuffled = shuffle(bottomX);
      const newStackIds = stackIds.slice(0,numStacks-num).concat(bottomXShuffled); 
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["groupById", dropdownOptions.destGroupId, "stackIds", newStackIds]]}})
      // Select random number
      const newIndex = getRandomIntInclusive(numStacks-num,numStacks);
      // Move card in
      gameBroadcast("game_action", {action: "move_card", options: {card_id: menuCard.id, dest_group_id: dropdownOptions.destGroupId, dest_stack_index: newIndex, dest_card_index: 0, combine: false, preserve_state: false}})
      chatBroadcast("game_update", {message: "shuffled "+displayName+" into the bottom "+num+" of "+destGroupTitle+"."})
    }
  } else if (dropdownOptions.action === "incrementTokenPerRound") {
      const increment = dropdownOptions.increment;
      const tokenType = dropdownOptions.tokenType;
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["cardById", menuCard.id, "tokensPerRound", tokenType, increment]]}})
      chatBroadcast("game_update", {message: "added "+increment+" "+tokenType+" token(s) per round to "+displayName+"."})
  } else if (dropdownOptions.action === "toggleTrigger") {
    const stepId = dropdownOptions.stepId;
    const currentFace = getCurrentFace(menuCard);
    const triggers = [...currentFace.triggers];
    if (triggers.includes(stepId)) {
      const triggerIndex = triggers.indexOf(stepId);
      if (triggerIndex !== -1) triggers.splice(triggerIndex, 1);
      chatBroadcast("game_update", {message: "removed a step "+stepId+" trigger from "+displayName+"."})
      gameBroadcast("game_action", {action: "card_action", options: {action: "remove_trigger", card_id: menuCard.id, options: {round_step: stepId}}})
    } else {
      triggers.push(stepId);
      chatBroadcast("game_update", {message: "added a step "+stepId+" trigger to "+displayName+"."})
      gameBroadcast("game_action", {action: "card_action", options: {action: "add_trigger", card_id: menuCard.id, options: {round_step: stepId}}})
    }
    gameBroadcast("game_action", {action: "update_values", options: {updates: [["cardById", menuCard.id, "sides", menuCard.currentSide, "triggers", triggers]]}})
    
  } else if (dropdownOptions.action === "swap_with_top") {
    const gsc = getGroupIdStackIndexCardIndex(game, menuCard.id);
    const stackIndex = gsc.stackIndex;
    const deckStackIds = game.groupById[playerN+"Deck"].stackIds;
    if (deckStackIds.length > 0) {
        const stackId0 = deckStackIds[0];
        const cardId0 = game.stackById[stackId0].cardIds[0];
        //gameBroadcast("game_action", {action: "swap_card", options: {card_id_1: }})
        gameBroadcast("game_action", {action: "move_card", options: {card_id: menuCard.id, dest_group_id: playerN+"Deck", dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}})
        gameBroadcast("game_action", {action: "move_card", options: {card_id: cardId0, dest_group_id: playerN+"Hand", dest_stack_index: stackIndex, dest_card_index: 0, combine: false, preserve_state: false}})
        chatBroadcast("game_update", {message: "swapped a card in their hand with the top of their deck."})       
    }
  } else if (dropdownOptions.action === "setRotation") {
    chatBroadcast("game_update", {message: "set rotation of "+displayName+" to "+dropdownOptions.rotation+"."})
    gameBroadcast("game_action", {action: "update_values", options: {updates: [["cardById", menuCard.id, "rotation", dropdownOptions.rotation]]}})
  } */
}

export const useDropdownClickGroup = (dropdownOptions, actionProps) => {
  const {state, dispatch, gameBroadcast, chatBroadcast} = actionProps;
  const gameUi = state.gameUi;
  const game = gameUi.game;
  const dropdownMenuObj = state.playerUi.dropdownMenuObj;
  const playerN = state.playerUi.playerN;
  const group = dropdownMenuObj.group;
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
  gameBroadcast("game_action", {action: "update_values", options: {updates: [["firstPlayer", dropdownOptions.action]]}})
  chatBroadcast("game_update",{message: "set first player to "+dropdownOptions.title+"."})
} 