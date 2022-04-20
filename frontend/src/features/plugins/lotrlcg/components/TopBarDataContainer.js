import React from "react";
import { useSelector } from 'react-redux';
import { getCurrentFace } from "../functions/helpers";
import { TopBarUser } from "./TopBarUser";
import { TopBarShared } from "./TopBarShared";

export const TopBarDataContainer = React.memo(({}) => {
  
    const stagingStackIds = useSelector(state => state?.gameUi?.game?.groupById?.sharedStaging.stackIds);
    const cardById = useSelector(state => state?.gameUi?.game?.cardById); 
    const stackById = useSelector(state => state?.gameUi?.game?.stackById);
    const numPlayers = useSelector(state => state?.gameUi?.game?.numPlayers);
    const playerData = useSelector(state => state?.gameUi?.game?.playerData);
    
    if (!stagingStackIds) return;

    var stagingThreat = 0;
    stagingStackIds.forEach(stackId => {
      const stack = stackById[stackId];
      const topCardId = stack?.cardIds[0];
      const topCard = cardById[topCardId];
      const currentFace = getCurrentFace(topCard);
      if (currentFace) stagingThreat = stagingThreat + currentFace["threat"] + topCard["tokens"]["threat"];
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
    var totalWillpower = 0;
    for (var i =1; i<=numPlayers; i++) {
      const playerI = "player"+i;
      totalWillpower += playerData[playerI].willpower;
    }
    const totalProgress = totalWillpower - stagingThreat;

    return(
      <div className="h-full">
        <TopBarShared 
          threat={stagingThreat}
          progress={totalProgress}
        />
        <TopBarUser
          playerI={"player1"}
        />
        {numPlayers > 1 &&
        <TopBarUser
          playerI={"player2"}
        />}
        {numPlayers > 2 &&
        <TopBarUser
          playerI={"player3"}
        />}
        {numPlayers > 3 &&
        <TopBarUser
          playerI={"player4"}
        />}
      </div>
    )
})