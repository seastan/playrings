import React, { useEffect } from "react";
import { useSelector } from 'react-redux';
import { GROUPSINFO } from "./Constants";
import { loadRingsDb } from "./Helpers";
import useProfile from "../../hooks/useProfile";
import store from "../../store";

export const OnLoad = React.memo(({
    gameBroadcast,
    chatBroadcast,
}) => {
  const options = useSelector(state => state.gameUi?.game?.options);  
  const ringsDbInfo = options?.ringsDbInfo;
  const groupById = useSelector(state => state.gameUi?.game.groupById);
  const myUserId = useProfile()?.id;
  const createdBy = useSelector(state => state.gameUi?.created_by);
  const isHost = myUserId === createdBy;
  const deckToLoad = ringsDbInfo?.[0] || ringsDbInfo?.[1] || ringsDbInfo?.[2] || ringsDbInfo?.[3]
  const loaded = useSelector(state => state?.roomUi?.loaded);
  if (loaded) return;

  console.log("Rendering OnLoad", options);
  useEffect(() => {
    const gameUi = store.getState()?.gameUi;
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
        loadRingsDb(gameUi, playerI, deckDomain, deckType, deckId, gameBroadcast, chatBroadcast);
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