import { getCurrentFace } from "../../plugins/lotrlcg/functions/helpers";


export const flatListOfCards = (game) => {
  const groupById = game.groupById;
  const allCards = [];
  Object.keys(groupById).forEach((groupId) => {
    const group = groupById[groupId];
    const stackIds = group.stackIds;
    for (var s = 0; s < stackIds.length; s++) {
      const stackId = stackIds[s];
      const stack = game.stackById[stackId];
      const cardIds = stack.cardIds;
      for (var c = 0; c < cardIds.length; c++) {
        const cardId = cardIds[c];
        const card = game.cardById[cardId];
        const indexedCard = {
          ...card,
          ["groupId"]: groupId,
          ["stackId"]: stackId,
          ["stackIndex"]: s,
          ["cardIndex"]: c,
          ["groupType"]: group.type,
        };
        allCards.push(indexedCard);
      }
    }
  });
  return allCards;
};
// Takes in something like [["groupId","controllerDeck"],["stackIndex",0]] with "player1" and outputs [["groupId","player1Deck"],["stackIndex",0]]

export const formatCriteria = (criteria, playerN, controller) => {
  const formattedCriteria = [];
  for (var criterion of criteria) {
    const formattedCriterion = [];
    for (var item of criterion) {
      if (typeof item === 'string')
        item = item.replace("controller", controller);
      if (typeof item === 'string')
        item = item.replace("playerN", playerN);
      formattedCriterion.push(item);
    }
    formattedCriteria.push(formattedCriterion);
  }
  return formattedCriteria;
};
// Takes in something like [["groupId","controllerDeck"],["stackIndex",0]] with "player1" and outputs [["groupId","player1Deck"],["stackIndex",0]]
export const formatOptions = (options, playerN, controller) => {
  const formattedOptions = {};
  for (var option of Object.keys(options)) {
    var value = options[option];
    if (option === "updates")
      value = formatCriteria(value, playerN, controller);
    if (typeof value === 'string')
      value = value.replace("controller", controller);
    if (typeof value === 'string')
      value = value.replace("playerN", playerN);
    formattedOptions[option] = value;
  }
  return formattedOptions;
};

export const passesCriterion = (card, obj, criterion) => {
  if (card === null || obj === null || criterion === null)
    return false;
  if (criterion.length === 0)
    return false;
  if (criterion.length === 1)
    return obj === criterion[0];
  var par = criterion[0];
  if (par === "sideUp")
    par = card["currentSide"];
  if (par === "sideDown")
    par = card["currentSide"] === "A" ? "B" : "A";
  if (criterion.length > 1)
    return passesCriterion(card, obj[par], criterion.slice(1));
  return false;
};

export const passesCriteria = (card, criteria) => {
  for (var criterion of criteria) {
    if (!passesCriterion(card, card, criterion))
      return false;
  }
  return true;
};

export const listOfMatchingCards = (gameUi, criteria) => {
  const allCards = flatListOfCards(gameUi.game);
  const matchingCards = [];
  for (var card of allCards) {
    if (passesCriteria(card, criteria)) {
      matchingCards.push(card);
    }
  }
  return matchingCards;
};

export const functionOnMatchingCards = (gameUi, gameBroadcast, chatBroadcast, criteria, func, args) => {
  const cards = listOfMatchingCards(gameUi, criteria);
  for (var card of cards) {
    const cardName = getCurrentFace(card).printName;
    const groupId = card["group_id"];
    const stackIndex = card["stack_index"];
    const cardIndex = card["card_index"];
    switch (func) {
      case "increment_token":
        const tokenType = args[0];
        const increment = args[1];
        gameBroadcast("game_action", { action: func, options: { card_id: card.id, token_type: tokenType, increment: increment } });
        if (increment > 0) {
          if (increment === 1)
            chatBroadcast("game_update", { message: "added " + increment + " " + tokenType + " token to " + cardName + "." });
          else
            chatBroadcast("game_update", { message: "added " + increment + " " + tokenType + " tokens to " + cardName + "." });
        } else if (increment < 0) {
          if (increment === -1)
            chatBroadcast("game_update", { message: "removed " + (-increment) + " " + tokenType + " token from " + cardName + "." });
          else
            chatBroadcast("game_update", { message: "removed " + (-increment) + " " + tokenType + " tokens from " + cardName + "." });
        }
        break;
    }
  }
};
