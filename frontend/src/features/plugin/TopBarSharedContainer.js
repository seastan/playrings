import React from "react";
import { useSelector } from 'react-redux';
import { getCurrentFace } from "./Helpers"
import { TopBarShared } from "./TopBarShared"

export const TopBarSharedContainer = React.memo(({setPlayerWillpower}) => {
  
    const stagingStackIds = useSelector(state => state?.gameUi?.game?.groupById?.sharedStaging.stackIds);
    const cardById = useSelector(state => state?.gameUi?.game?.cardById); 
    const stackById = useSelector(state => state?.gameUi?.game?.stackById);  
    const roundStore = state => state?.gameUi?.game?.roundNumber;
    const round = useSelector(roundStore);  
    
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
    const totalWillpower = playerWillpower["player1"] + playerWillpower["player2"] + playerWillpower["player3"] + playerWillpower["player4"];
    const totalProgress = totalWillpower - stagingThreat;
    setPlayerWillpower(playerWillpower);

    return(
      <TopBarShared 
        round={round}
        threat={stagingThreat}
        progress={totalProgress}
      />
    )
})