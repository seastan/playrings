export const getCurrentFace = (card) => {
  if (!card) return null;
  return card["sides"][card["currentSide"]];
}

export const getDisplayName = (card) => {
  const currentSide = card["currentSide"];
  const currentFace = getCurrentFace(card);
  if (currentSide == "A") {
      const printName = currentFace["printName"];
      const id = card["id"];
      const id4digit = id.substr(id.length - 4);
      return printName;//+' ('+id4digit+')'; // Add unique identifier?
  } else { // Side B logic
      const sideBName = card["sides"]["B"]["name"];
      if (sideBName == "player") {
          return 'player card';
      } else if (sideBName == "encounter") {
          return 'encounter card';
      } else if (sideBName) {
          const printName = currentFace["printName"];
          const id = card["id"];
          const id4digit = id.substr(id.length - 4);
          return printName;//+' ('+id4digit+')'; // Add unique identifier?
      } else {
          return 'undefinedCard';
      }
  }
}

export const getFlippedCard = (card) => {
  return (card["currentSide"] === "A") ? {...card, ["currentSide"]: "B"} : {...card, ["currentSide"]: "A"};
}

export const getDisplayNameFlipped = (card) => {
  return getDisplayName(getFlippedCard(card));
}

export const getVisibleSide = (card, playerN) => {
  if (!card) return null;
  const currentSide = card["currentSide"];
  if (currentSide == "A" || card["peeking"][playerN]) return "A";
  else return "B";
}

export const getVisibleFace = (card, playerN) => {
  const visibleSide = getVisibleSide(card, playerN);
  if (visibleSide) return card["sides"][visibleSide];
  else return null;
}

export const getVisibleFaceSRC = (card, playerN) => {
  if (!card) return "";
  const visibleSide = getVisibleSide(card, playerN);
  if (visibleSide == "A") {
      return process.env.PUBLIC_URL + '/images/cards/' + card['cardDbId'] + '.jpg';
  } else { // Side B logic
      const sideBName = card["sides"]["B"]["name"];
      if (sideBName == "player") {
          return process.env.PUBLIC_URL + '/images/cardbacks/player.jpg';
      } else if (sideBName == "encounter") {
          return process.env.PUBLIC_URL + '/images/cardbacks/encounter.jpg';
      } else if (sideBName) {
          return process.env.PUBLIC_URL + '/images/cards/' + card['cardDbId'] + '.B.jpg';
      } else {
          return '';
      }
  }
}

export const usesThreatToken = (cardType) => {
  if (["Contract", "Hero", "Ally", "Attachment", "Event", "Objective Ally"].includes(cardType)) return false;
  return true;
} 

export const processTokenType = (tokenType, cardType) => {
  if (tokenType === "willpowerThreat") return usesThreatToken(cardType) ? "threat" : "willpower";
  return tokenType;
}

export const tokenPrintName = (tokenType) => {
  if (tokenType === "hitPoints") return "hit points";
  return tokenType;
}

export const getCardWillpower = (card) => {
  const currentFace = getCurrentFace(card);
  return currentFace.willpower + card.tokens.willpower;
}

export const GetPlayerN = (playerIDs, id) => {
  var playerN = null;
  Object.keys(playerIDs).forEach(playerI => {
    if (playerIDs[playerI] === id) playerN = playerI;
  })
  return playerN;
}

export const getParentCardsInGroup = (game, groupId) => {
  const stackIds = game["groupById"][groupId]["stackIds"];
  const parentCards = [];
  for (var stackId of stackIds) {
    const cardIds = game["stackById"][stackId]["cardIds"];
    const parentCardId = cardIds[0];
    const parentCard = game["cardById"][parentCardId];
    parentCards.push(parentCard);
  }
  return parentCards;
}

 // List of playerN strings of players that are seated and not eliminated
export const seatedNonEliminated = (gameUi) => {
  const playerIDs = gameUi["playerIds"]
  const playerData = gameUi["game"]["playerData"]
  var seated = []
  Object.keys(playerIDs).forEach((PlayerI) => {
    if (playerIDs[PlayerI] && !playerData[PlayerI]["eliminated"]) {
      seated.push(PlayerI);
    }
  })
  return seated;
}

export const leftmostNonEliminatedPlayerN = (gameUi) => {
  const seatedPlayerNs = seatedNonEliminated(gameUi);
  return seatedPlayerNs[0];
}

export const getNextPlayerN = (gameUi, playerN) => {
  const seatedPlayerNs = seatedNonEliminated(gameUi);
  const seatedPlayerNs2 = seatedPlayerNs.concat(seatedPlayerNs);
  var nextPlayerN = null;
  for (var i=0; i<seatedPlayerNs2.length/2; i++) {
    if (seatedPlayerNs2[i] === playerN) nextPlayerN = seatedPlayerNs2[i+1];
  }
  if (nextPlayerN === playerN) nextPlayerN = null;
  return nextPlayerN;
}

export const flatListOfCards = (gameUi) => {
  const groupById = gameUi["game"]["groupById"];
  const allCards = [];
  Object.keys(groupById).forEach((groupId) => {
    const group = groupById[groupId];
    console.log("flattening",groupId);
    const stacks = group["stacks"];
    console.log(stacks);
    for (var s = 0; s < stacks.length; s++) {
      console.log(s);
      const stack = stacks[s];
      const cards = stack["cards"];
      for (var c = 0; c < cards.length; c++) {
        const card = cards[c];
        const indexedCard = {
          ...card,
          ["group_id"]: groupId,
          ["stack_index"]: s,
          ["card_index"]: c, 
        }
        allCards.push(indexedCard);
      }
    }
  })
  return allCards;
}

export const passesCriteria = (card, criteria) => {
  for (var criterion of criteria) {
    var objectToCheck = card;
    console.log("crit 0 ",criterion[0]);
    switch(criterion[0]) {
      case "sideA":
        console.log("A");
        objectToCheck = card["sides"]["A"];
        break;
      case "sideB":
        console.log("B");
        objectToCheck = card["sides"]["B"];
        break;
      case "sideUp":
        console.log("up");
        objectToCheck = getCurrentFace(card);
        break;
      case "sideDown":
        console.log("dwn");
        if (card["currentSide"] == "A") objectToCheck = card["sides"]["B"];
        else objectToCheck = card["sides"]["A"];
        break;
      case "tokens":
        console.log("tok");
        objectToCheck = card["tokens"];
        break;
      case "peeking":
        console.log("peek");
        objectToCheck = card["peeking"];
        break;
    }
    const property = criterion[1];
    const value = criterion[2];
    const passed_criterion = objectToCheck[property] === value;
    console.log("checking if ",objectToCheck,property,objectToCheck[property],value, passed_criterion   );
    if (!passed_criterion) return false;
  }
  return true;
}

const listOfMatchingCards = (gameUi, criteria) => {
  const allCards = flatListOfCards(gameUi);
  const matchingCards = [];
  for (var card of allCards) {
    if (passesCriteria(card, criteria)) {
      matchingCards.push(card);
    }
  }
  return matchingCards;
}

export const functionOnMatchingCards = (gameUi, gameBroadcast, chatBroadcast, criteria, func, args ) => {
  const cards = listOfMatchingCards(gameUi, criteria);
  for (var card of cards) {
    const cardName = getCurrentFace(card).printName;
    const groupId = card["group_id"];
    const stackIndex = card["stack_index"];
    const cardIndex = card["card_index"];
    console.log("performing function on matching cards")
    switch(func) {
      case "increment_token":
        const tokenType = args[0];
        const increment = args[1];
        console.log("increment_token", tokenType, increment);
        gameBroadcast("increment_token",{group_id: groupId, stack_index: stackIndex, card_index: cardIndex, token_type: tokenType, increment: increment})
        if (increment > 0) {
            if (increment === 1) chatBroadcast("game_update",{message: "added "+increment+" "+tokenType+" token to "+cardName+"."});
            else chatBroadcast("game_update",{message: "added "+increment+" "+tokenType+" tokens to "+cardName+"."});
        } else if (increment < 0) {
            if (increment === -1) chatBroadcast("game_update",{message: "removed "+(-increment)+" "+tokenType+" token from "+cardName+"."});
            else chatBroadcast("game_update",{message: "removed "+(-increment)+" "+tokenType+" tokens from "+cardName+"."});                
        }
        break;
    }
  }
}

export const getGroupByStackId = (groupById, stackId) => {
  const groupIds = Object.keys(groupById);
  for (var groupId of groupIds) {
    const group = groupById[groupId]; 
    if (group.stackIds.includes(stackId)) return group; 
  }
  return null;
}

export const getStackByCardId = (stackById, cardId) => {
  const stackIds = Object.keys(stackById);
  for (var stackId of stackIds) {
    const stack = stackById[stackId]; 
    if (stack.cardIds.includes(cardId)) return stack; 
  }
  return null;
}

export const getGroupIdStackIndexCardIndex = (game, cardId) => {
  const stack = getStackByCardId(game.stackById, cardId);
  if (!stack) return null;
  const group = getGroupByStackId(game.groupById, stack.id);
  if (!group) return null;
  return ({
    groupId: group.id, 
    stackIndex: group.stackIds.indexOf(stack.id), 
    cardIndex: stack.cardIds.indexOf(cardId)
  })
}



