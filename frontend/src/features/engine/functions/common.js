import React from "react";

export const keyClass = "m-auto border bg-gray-500 text-center bottom inline-block text-white";
export const keyStyle = {width: "3vh", height: "3vh", borderRadius: "0.5vh"}
export const keyStyleL = {width: "7vh", height: "3vh", borderRadius: "0.5vh"}
export const keyStyleXL = {width: "12vh", height: "3vh", borderRadius: "0.5vh"}
export const ATTACHMENT_OFFSET = 3.5;
export const DEFAULT_CARD_Z_INDEX = 1000;

export const playerColorMap = {
  "player1": "rgb(255,90,139)", // Red
  "player2": "rgb(121,180,255)", // Blue
  "player3": "rgb(101,241,18)", // Green
  "player4": "rgb(255,223,76)", // Yellow
  "player5": "rgb(225,138,244)", // Purple
  "player6": "rgb(255,187,191)", // Pink
  "player7": "rgb(0,201,187)", // Teal
  "player8": "rgb(255,142,12)", // Orange
}

export const getPlayerIColor = (playerI) => {
  return playerColorMap[playerI] || "rgba(128,128,128)";
}

export const keyDiv = (key, extraClasses = "") => {
  if (key.length > 6) return <div className={keyClass + " " + extraClasses} style={keyStyleXL}>{key}</div>
  else if (key.length > 1) return <div className={keyClass + " " + extraClasses} style={keyStyleL}>{key}</div>
  else return <div className={keyClass + " " + extraClasses} style={keyStyle}>{key}</div>
}

export const keysDiv = (keysString, extraClasses = "") => {
  const keys = keysString.split("+");
  return(
  <>
    {keys.map((key) => keyDiv(key, extraClasses))}
  </>
  )
};


export const defaultdict = (defaultObj, defaultVal) => {
  return new Proxy(defaultObj, {
    get: (target, name) => name in target ? target[name] : defaultVal
  });
}

export const convertToPercentage = (input) => {
  // If the input is a number, multiply by 100 and add a percent sign
  if (typeof input === 'number') {
    return `${input * 100}%`;
  }

  // Check if the input is a string and already includes a percentage sign
  if (input.endsWith('%')) {
    return input;
  }

  // Check if the input includes a slash, indicating it's a fraction
  const fractionRegex = /^(\d+)\/(\d+)$/;
  const match = input.match(fractionRegex);
  
  if (match) {
    const numerator = parseFloat(match[1]);
    const denominator = parseFloat(match[2]);

    if (denominator === 0) {
      return '0%';  // Avoid division by zero
    }

    const percentage = (numerator / denominator) * 100;
    return `${percentage}%`;
  }

  // If the input is neither a fraction nor a percentage parse it and add a percent
  return `${parseFloat(input)*100}%`;
}

export const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

export const getParentCardsInGroup = (game, groupId) => {
  const stackIds = game.groupById?.[groupId]?.stackIds || [];
  const parentCards = [];
  for (var stackId of stackIds) {
    const cardIds = game.stackById?.[stackId]?.cardIds;
    if (!cardIds || cardIds.length === 0) continue;
    const parentCardId = cardIds[0];
    const parentCard = game.cardById?.[parentCardId];
    if (parentCard) parentCards.push(parentCard);
  }
  return parentCards;
}

export const getVisibleSide = (card, playerN) => {
  if (!card) return null;
  const currentSide = card.currentSide;
  if (currentSide === "A" || card.peeking[playerN]) return "A";
  else return "B";
}
  
export const getVisibleFace = (card, playerN) => {
  const visibleSide = getVisibleSide(card, playerN);
  if (visibleSide) return card.sides[visibleSide];
  else return null;
}
  
export const getVisibleFaceSrc = (visibleFace, user, gameDef) => {
  if (!visibleFace) return {src: null, default: "image not found"};
  var src = visibleFace.imageUrl;
  // If there's no src listed, it's probably a card back
  if (!src || src ==="") {    
    src = gameDef?.cardBacks?.[visibleFace.name]?.imageUrl;
  }
  // If there's still no src listed, there's a problem with the card or game definition #FIXME: visual idicator of missing image
  if (!src || src ==="") src = ""
  const language = user?.language || "English";
  const srcLanguage = src.replace('/English/','/'+language+'/');
  
  return {
    src: srcLanguage,
    default: src
  }
}

// Returns the left offset of the first card in a group
export const getFirstCardOffset = (width, cardSize) => {
  return 0.2 + (1.39-width)*cardSize/2;
}
