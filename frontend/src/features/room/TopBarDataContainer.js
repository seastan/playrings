import React, { Component, useState, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentFace } from "./Helpers";
import { TopBarUser } from "./TopBarUser";
import { TopBarShared } from "./TopBarShared";
import { GROUPSINFO, sectionToLoadGroupId, sectionToDiscardGroupId } from "./Constants";

export const TopBarDataContainer = React.memo(({
  playerN,
  gameBroadcast,
  chatBroadcast,
  setTyping,
}) => {
  
    const stagingStore = state => state?.gameUi?.game?.groupById?.sharedStaging.stackIds;
    const stagingStackIds = useSelector(stagingStore);
    const cardStore = state => state?.gameUi?.game?.cardById;
    const cardById = useSelector(cardStore); 
    const stackStore = state => state?.gameUi?.game?.stackById;
    const stackById = useSelector(stackStore);
    const numPlayersStore = state => state.gameUi.game.numPlayers;
    const numPlayers = useSelector(numPlayersStore);
    const playerDataStore = state => state.gameUi.game.playerData;
    const playerData = useSelector(playerDataStore);

    // const playerDataStore = state => state?.gameUi?.game?.playerData;
    // const playerData = useSelector(playerDataStore);
    
    if (!stagingStackIds) return;

    var stagingThreat = 0;
    stagingStackIds.forEach(stackId => {
      const stack = stackById[stackId];
      const topCardId = stack.cardIds[0];
      const topCard = cardById[topCardId];
      const currentFace = getCurrentFace(topCard);
      stagingThreat = stagingThreat + currentFace["threat"] + topCard["tokens"]["threat"];
    })

    const playerWillpower = {"player1": 0, "player2": 0, "player3": 0, "player4": 0};
    Object.keys(cardById).forEach((cardId) => {
      const card = cardById[cardId];
      const currentFace = getCurrentFace(card);
      const cardWillpower = currentFace.willpower || 0;
      if (card.committed) {
        playerWillpower[card.controller] += cardWillpower + card.tokens.willpower;
      }
    })
    //const totalWillpower = playerWillpower["player1"] + playerWillpower["player2"] + playerWillpower["player3"] + playerWillpower["player4"];
    var totalWillpower = 0;
    for (var i =1; i<=numPlayers; i++) {
      const playerI = "player"+i;
      totalWillpower += playerData[playerI].willpower;
    }
    const totalProgress = totalWillpower - stagingThreat;

    return(
      <div className="h-full">
        <TopBarShared 
          playerN={playerN}
          threat={stagingThreat}
          progress={totalProgress}
          gameBroadcast={gameBroadcast}
          chatBroadcast={chatBroadcast}
          setTyping={setTyping}
        />
        <TopBarUser
          playerN={playerN}
          playerI={"player1"}
          gameBroadcast={gameBroadcast}
          chatBroadcast={chatBroadcast}
          setTyping={setTyping}
        />
        {numPlayers > 1 &&
        <TopBarUser
          playerN={playerN}
          playerI={"player2"}
          gameBroadcast={gameBroadcast}
          chatBroadcast={chatBroadcast}
          setTyping={setTyping}
        />}
        {numPlayers > 2 &&
        <TopBarUser
          playerN={playerN}
          playerI={"player3"}
          gameBroadcast={gameBroadcast}
          chatBroadcast={chatBroadcast}
          setTyping={setTyping}
        />}
        {numPlayers > 3 &&
        <TopBarUser
          playerN={playerN}
          playerI={"player4"}
          gameBroadcast={gameBroadcast}
          chatBroadcast={chatBroadcast}
          setTyping={setTyping}
        />}
      </div>
    )
})