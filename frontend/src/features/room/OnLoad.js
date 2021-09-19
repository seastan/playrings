import React, { useEffect } from "react";
import { useSelector } from 'react-redux';
import { GROUPSINFO } from "./Constants";
import { loadRingsDb } from "./Helpers";
import useProfile from "../../hooks/useProfile";

export const OnLoad = React.memo(({
    setLoaded,
    gameBroadcast,
    chatBroadcast,
}) => {
  const optionsStore = state => state.gameUi?.game?.options;
  const options = useSelector(optionsStore);  
  const ringsDbInfo = options?.ringsDbInfo;
  const groupByIdStore = state => state.gameUi?.game.groupById;
  const groupById = useSelector(groupByIdStore);
  const myUser = useProfile();
  const myUserID = myUser?.id;
  const createdByStore = state => state.gameUi?.created_by;
  const createdBy = useSelector(createdByStore);
  const isHost = myUserID === createdBy;
  const deckToLoad = ringsDbInfo?.[0] || ringsDbInfo?.[1] || ringsDbInfo?.[2] || ringsDbInfo?.[3]

  console.log("Rendering OnLoad", options);
  useEffect(() => {
    if (!options || !isHost) return;
    if (deckToLoad && options["loaded"] !== true) {
      setLoaded(true);
      const newOptions = {...options, loaded: true}
      // Turn off trigger
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["game", "options", newOptions]]}})
      // Load ringsdb decks by ids
      var numDecks = 1;
      for (var i=1; i<=4; i++) {
        const playerI = "player"+i;
        if (!ringsDbInfo[i-1]) continue;
        numDecks = i;
        console.log("Rendering OnLoad", ringsDbInfo[i-1]);
        const deckType = ringsDbInfo[i-1].type;
        const deckId = ringsDbInfo[i-1].id;
        const deckDomain = ringsDbInfo[i-1].domain;
        loadRingsDb(playerI, deckDomain, deckType, deckId, gameBroadcast, chatBroadcast);
      }
      if (numDecks>1 && numDecks<=4) {
        gameBroadcast("game_action", {action: "update_values", options: {updates: [["game", "numPlayers", numDecks]]}});
        chatBroadcast("game_update", {message: "set the number of players to: " + numDecks});
      }
      // Loop over decks complete
    } // End if ringsDb
    // Shuffle all decks if setting was set
    if (options["loadShuffle"]) {
      // Turn off trigger
      const updates = [["game", "options", "loadShuffle", false]];
      gameBroadcast("game_action", {action: "update_values", options: {updates: updates}});
      //dispatch(setValues({updates: updates}));
      Object.keys(groupById).forEach((groupId) => {
        const group = groupById[groupId];
        if (group.type === "deck" && group.stackIds.length > 0) {
          gameBroadcast("game_action", {action: "shuffle_group", options: {group_id: groupId}})
          chatBroadcast("game_update", {message: " shuffled " + GROUPSINFO[groupId].name+"."})
        }
      })
    }
  }, [options]);

  return;
})