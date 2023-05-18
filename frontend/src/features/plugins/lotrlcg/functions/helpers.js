import { sectionToLoadGroupId, sectionToDiscardGroupId, sectionToDeckGroupId } from "../definitions/constants";
import axios from "axios";
import { setLoaded, setTooltipIds } from "../../../store/playerUiSlice";
import store from "../../../../store";

const cardDb = [];



export const shuffle = (array) => {
  var m = array.length, t, i;
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);
    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

export const getFlippedCard = (card) => {
  return (card.currentSide === "A") ? {...card, ["currentSide"]: "B"} : {...card, ["currentSide"]: "A"};
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

export const getCardByGroupIdStackIndexCardIndex = (game, groupId, stackIndex, cardIndex) => {
  const stackIds = game.groupById[groupId].stackIds;
  if (stackIndex >= stackIds.length) return null;
  const stackId = stackIds[stackIndex];
  const cardIds = game.stackById[stackId].cardIds;
  if (cardIndex >= cardIds.length) return null;
  const cardId = cardIds[cardIndex];
  return game.cardById[cardId];
}

export const doListsOverlap = (list1, list2) => {
  for (var item1 of list1) {
    if (list2.includes(item1)) return true;
  }
  return false;
}

export const getSideAName = (card) => {
  return card["sides"]["A"]["name"];
}

const isCardDbIdInLoadList = (loadList, cardDbId) => {
  for (var item of loadList) {
    if (item.groupId.includes("Sideboard")) continue;
    if (item.cardRow.cardid === cardDbId) {
      return true;
    }
  }  
}

const moveCardInLoadList = (loadList, cardDbId, groupId) => {
  for (var i=0; i<loadList.length; i++) {
    const item = loadList[i];
    if (item.cardRow.cardid === cardDbId) {
      if (item.quantity > 0) {
        loadList[i] = {...item, quantity: item.quantity - 1};
        loadList.push({...item, quantity: 1, groupId: groupId})
        return;
      }
    }
  }
}

export const arrayMove = (arr, old_index, new_index) => {
  while (old_index < 0) {
      old_index += arr.length;
  }
  while (new_index < 0) {
      new_index += arr.length;
  }
  if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
          arr.push(undefined);
      }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr;
};

export const flattenLoadList = (loadList) => {
  // Takes a load list where elements might have a quantity>1 property and splits them into elements with quantity=1
  const n = loadList.length;
  for (var i=0; i<n; i++) {
    const item = loadList[i];
    const quantity = item.quantity;
    if (quantity > 1) {
      for (var j=0; j<(quantity-1); j++) {
        loadList[i] = {...item, quantity: item.quantity - 1};
        loadList.push({...item, quantity: 1})
      }
    }
  }
}

export const buildLoadList = (reducedLoadList) => {
  const loadList = [];
  for (var item of reducedLoadList) {
    if (item.cardRow.cardid) {
      loadList.push({...item, cardRow: cardDb[item.cardRow.cardid]})
    } else {
      loadList.push(item)
    }
  }
  return loadList;
}

export const processLoadList = (loadList, playerN) => {
  var newLoadList = [...loadList];
  var n = newLoadList.length;

  for (var i=0; i<n; i++) {
    const item = newLoadList[i];
    if (item.cardRow.sides.A.type === "Contract") {
      newLoadList = arrayMove(newLoadList, i, 0); 
    }
  }

  for (var i=0; i<n; i++) {
    const item = newLoadList[i];
    if (item.cardRow.loadgroupid) {
      item.cardRow.deckgroupid = item.cardRow.loadgroupid; // Legacy
    }
    if (item.cardRow.deckgroupid?.includes("playerN")) {
      item.cardRow.deckgroupid = item.cardRow.deckgroupid.replace("playerN", playerN);
    }
    if (item.groupId.includes("playerN")) {
      item.groupId = item.groupId.replace("playerN", playerN);
    }
    console.log("item ", item)
  }

  const loreThurindir = isCardDbIdInLoadList(newLoadList, "12946b30-a231-4074-a524-960365081360");
  n = newLoadList.length;
  if (loreThurindir) {
    for (var i=0; i<n; i++) {
      const item = newLoadList[i];
      if (item.cardRow.sides.A.type == "Side Quest" && item.groupId.includes("player") && item.groupId.includes("Deck")) {
        if (item.quantity > 0) {
          newLoadList[i] = {...item, quantity: item.quantity - 1};
          newLoadList.push({...item, quantity: 1, groupId: playerN+"Play2"})
        }
      }
    }  
  }

  const theOneRing = isCardDbIdInLoadList(newLoadList, "423e9efe-7908-4c04-97bd-f4a826081c9f");
  n = newLoadList.length;
  if (theOneRing) {
    for (var i=0; i<n; i++) {
      const item = newLoadList[i];
      if (item.cardRow.sides.A.traits.includes("Master.")) {
        if (item.quantity > 0) {
          newLoadList[i] = {...item, quantity: item.quantity - 1};
          newLoadList.push({...item, quantity: 1, groupId: playerN+"Play2"})
        }
      }
    }  
  } 

  const glitteringCaves = isCardDbIdInLoadList(loadList, "03a074ce-d581-4672-b6ea-ed97b7afd415");
  n = newLoadList.length;
  if (glitteringCaves) {
    const extraNum = [1,1,1,1,2,2,2,2,3,3,3,3];
    const shuffledExtraNum = shuffle(extraNum);
    var e = 0;
    for (var i=0; i<n; i++) {
      const item = newLoadList[i];
      if (item.cardRow.cardencounterset === "Exploring the Caves") {
        if (e < shuffledExtraNum.length) {
          newLoadList[i] = {...item, groupId: "sharedExtra"+shuffledExtraNum[e]};
          e = e + 1;
        }
      }
    }  
  } 
  const wainriders = isCardDbIdInLoadList(loadList, "21165a65-1296-4664-a880-d85eea19a4ae");
  if (wainriders) {
    moveCardInLoadList(newLoadList,"b7f25c2a-b9f1-4ec7-8ab3-4843aaef4e06","sharedExtra1"); // 1
    moveCardInLoadList(newLoadList,"21165a65-1296-4664-a880-d85eea19a4ae","sharedExtra1"); // 6
    moveCardInLoadList(newLoadList,"727b90c5-46b3-4568-9ab9-cb7c6e662428","sharedExtra1"); // Objective
    moveCardInLoadList(newLoadList,"c2ff668a-6174-47d4-bbab-46f9c91403eb","sharedExtra1"); // Objective
    moveCardInLoadList(newLoadList,"4c1e8a5c-db6b-4d36-8202-bf0960870914","sharedExtra2"); // 2
    moveCardInLoadList(newLoadList,"282bca71-ff04-4447-a4e9-a7e5f70e0083","sharedExtra2"); // 5
    moveCardInLoadList(newLoadList,"29fd0721-10ed-4315-b415-5fadeb010051","sharedExtra3"); // 3
    moveCardInLoadList(newLoadList,"fbfee53c-fec3-4b55-a8b4-c7329f8f973e","sharedExtra3"); // 4
  }

  const templeOfTheDeceived = isCardDbIdInLoadList(loadList, "fb7d55c5-7198-45c5-97d7-be4c6a26fa68");
  if (templeOfTheDeceived) {
    flattenLoadList(newLoadList);
    n = newLoadList.length;
    // Loop randomly over array
    const accessOrder = shuffle([...Array(n).keys()]);
    // Temples
    var extraNum = [1,2,3];
    var e = 0;
    for (var i of accessOrder) {
      const item = newLoadList[i];
      if (item.cardRow.sides.A.name === "Temple of the Deceived" && item.cardRow.sides.A.type === "Location") {
        if (e < extraNum.length) {
          newLoadList[i] = {...item, quantity: item.quantity - 1};
          newLoadList.push({...item, quantity: 1, groupId: "sharedExtra"+extraNum[e]})
          e = e + 1;
        }
      }
    }
    // Lost Islands
    extraNum = [1,1,1,1,2,2,2,2,3,3,3,3];
    e = 0;
    for (var i of accessOrder) {
      const item = newLoadList[i];
      if (item.cardRow.sides.A.name === "Lost Island" && item.cardRow.sides.A.type === "Location") {
        if (e < extraNum.length) {
          newLoadList[i] = {...item, groupId: "sharedExtra"+extraNum[e]};
          e = e + 1;
        }
      }
    }
  }

  const theNineAreAbroad = isCardDbIdInLoadList(loadList, "5c8e7eab-3899-489e-a801-3ac34b77f62f");
  if (theNineAreAbroad) {
    flattenLoadList(newLoadList);
    n = newLoadList.length;
    for (var i=0; i<n; i++) {
      const item = newLoadList[i];
      if (item.cardRow.sides.A.name === "The Blue Mountains") {
        newLoadList[i] = {...item, quantity: item.quantity - 1};
        newLoadList.push({...item, quantity: 1, groupId: "sharedExtra1"})
      }
    } 
    for (var i=0; i<n; i++) {
      const item = newLoadList[i];
      if (item.cardRow.sides.A.name === "Arnor") {
        newLoadList[i] = {...item, quantity: item.quantity - 1};
        newLoadList.push({...item, quantity: 1, groupId: "sharedExtra1"})
      }
    } 
    for (var i=0; i<n; i++) {
      const item = newLoadList[i];
      if (item.cardRow.sides.A.name === "Rhovanion") {
        newLoadList[i] = {...item, quantity: item.quantity - 1};
        newLoadList.push({...item, quantity: 1, groupId: "sharedExtra1"})
      }
    } 
    for (var i=0; i<n; i++) {
      const item = newLoadList[i];
      if (item.cardRow.sides.A.name === "Harlindon") {
        newLoadList[i] = {...item, quantity: item.quantity - 1};
        newLoadList.push({...item, quantity: 1, groupId: "sharedExtra2"})
      }
    } 
    for (var i=0; i<n; i++) {
      const item = newLoadList[i];
      if (item.cardRow.sides.A.name === "Eriador") {
        newLoadList[i] = {...item, quantity: item.quantity - 1};
        newLoadList.push({...item, quantity: 1, groupId: "sharedExtra2"})
      }
    } 
    for (var i=0; i<n; i++) {
      const item = newLoadList[i];
      if (item.cardRow.sides.A.name === "Mirkwood") {
        newLoadList[i] = {...item, quantity: item.quantity - 1};
        newLoadList.push({...item, quantity: 1, groupId: "sharedExtra2"})
      }
    } 
    for (var i=0; i<n; i++) {
      const item = newLoadList[i];
      if (item.cardRow.sides.A.name === "The Nine are Abroad 2") {
        newLoadList[i] = {...item, quantity: item.quantity - 1};
        newLoadList.push({...item, quantity: 1, groupId: "sharedExtra3"})
      }
    } 
    for (var i=0; i<n; i++) {
      const item = newLoadList[i];
      if (item.cardRow.sides.A.name === "Enedwaith") {
        newLoadList[i] = {...item, quantity: item.quantity - 1};
        newLoadList.push({...item, quantity: 1, groupId: "sharedExtra3"})
      }
    } 
    for (var i=0; i<n; i++) {
      const item = newLoadList[i];
      if (item.cardRow.sides.A.name === "Rohan") {
        newLoadList[i] = {...item, quantity: item.quantity - 1};
        newLoadList.push({...item, quantity: 1, groupId: "sharedExtra3"})
      }
    } 
    for (var i=0; i<n; i++) {
      const item = newLoadList[i];
      if (item.cardRow.sides.A.name === "The Nine are Abroad 3") {
        newLoadList[i] = {...item, quantity: item.quantity - 1};
        newLoadList.push({...item, quantity: 1, groupId: "sharedExtra4"})
      }
    } 
    for (var i=0; i<n; i++) {
      const item = newLoadList[i];
      if (item.cardRow.sides.A.name === "The Outlands") {
        newLoadList[i] = {...item, quantity: item.quantity - 1};
        newLoadList.push({...item, quantity: 1, groupId: "sharedExtra4"})
      }
    } 
    for (var i=0; i<n; i++) {
      const item = newLoadList[i];
      if (item.cardRow.sides.A.name === "Gondor") {
        newLoadList[i] = {...item, quantity: item.quantity - 1};
        newLoadList.push({...item, quantity: 1, groupId: "sharedExtra4"})
      }
    } 
  }
  return newLoadList; 

}

export const processPostLoad = (gameUi, loadList, playerN, gameBroadcast, chatBroadcast) => {
  const tacticsEowyn = isCardDbIdInLoadList(loadList, "6dc19efc-af54-4eff-b9ee-ee45e9fd4072")
  if (tacticsEowyn) {
    gameBroadcast("game_action", {action: "increment_threat", options: {increment: -3, for_player_n: playerN}})
    chatBroadcast("game_update", {message: "reduced threat by 3."});
  }
  const loreFatty = isCardDbIdInLoadList(loadList, "151ba48a-1efd-451e-bba0-b49fa0566596")
  if (loreFatty) {
    gameBroadcast("game_action", {action: "increment_threat", options: {increment: -2}})
    chatBroadcast("game_update", {message: "reduced threat by 2."});
  }
  const glitteringCaves = isCardDbIdInLoadList(loadList, "03a074ce-d581-4672-b6ea-ed97b7afd415");
  if (glitteringCaves) {
    gameBroadcast("game_action", {action: "update_values", options: {updates: [["layout", "extra"]]}});
    gameBroadcast("game_action", {action: "shuffle_group", options: {group_id: "sharedExtra1"}})
    gameBroadcast("game_action", {action: "shuffle_group", options: {group_id: "sharedExtra2"}})
    gameBroadcast("game_action", {action: "shuffle_group", options: {group_id: "sharedExtra3"}})
  }
  const wainriders = isCardDbIdInLoadList(loadList, "21165a65-1296-4664-a880-d85eea19a4ae");
  if (wainriders) {
    gameBroadcast("game_action", {action: "update_values", options: {updates: [["layout", "extra"]]}});
  }
  const templeOfTheDeceived = isCardDbIdInLoadList(loadList, "fb7d55c5-7198-45c5-97d7-be4c6a26fa68");
  if (templeOfTheDeceived) {
    gameBroadcast("game_action", {action: "update_values", options: {updates: [["layout", "extra"]]}});
    gameBroadcast("game_action", {
      action: "action_on_matching_cards",
      options: {criteria:[["groupId", "sharedExtra1"], ["stackIndex", 0]], action: "flip_card", options: {}
    }});
    gameBroadcast("game_action", {
      action: "action_on_matching_cards",
      options: {criteria:[["groupId", "sharedExtra3"], ["stackIndex", 0]], action: "flip_card", options: {}
    }});
  }
  const theNineAreAbroad = isCardDbIdInLoadList(loadList, "5c8e7eab-3899-489e-a801-3ac34b77f62f");
  if (theNineAreAbroad) {
    gameBroadcast("game_action", {action: "update_values", options: {updates: [["game", "layout", "extra4"]]}});
  }

}

export const refinedLoadList = (xmlText,playerN) => {
  var parseString = require('xml2js').parseString;
  var loadList = [];
  parseString(xmlText, function (err, deckJSON) {
    if (!deckJSON) return;
    const sections = deckJSON.deck.section;

    var containsPlaytest = false;
    sections.forEach(section => {
      const cards = section.card;
      if (!cards) return;
      cards.forEach(card => {
        console.log("loadcard", card)
        const cardDbId = card['$'].id;
        var cardRow = cardDb[cardDbId];
        if (cardRow && cardRow["playtest"]) {
          containsPlaytest = true;
        }
      })
    })

    sections.forEach(section => {
      const sectionName = section['$'].name;
      const cards = section.card;
      if (!cards) return;
      cards.forEach(card => {
        const cardDbId = card['$'].id;
        const quantity = parseInt(card['$'].qty);
        var cardRow = cardDb[cardDbId];
        if (!cardRow) {
          alert("Encountered unknown card ID for "+card["_"])
        } else {
          cardRow['deckgroupid'] = sectionToDeckGroupId(sectionName,playerN);
          cardRow['discardgroupid'] = sectionToDiscardGroupId(sectionName,playerN);
          if (cardRow['sides']['A']['keywords'].includes("Encounter")) cardRow['discardgroupid'] = "sharedEncounterDiscard";
          loadList.push({'uuid': cardDbId, 'quantity': quantity, 'loadGroupId': sectionToLoadGroupId(sectionName,playerN)})
        }
      })
    })
  })
  return loadList;
}

export const loadDeckFromXmlText = (xmlText, playerN, gameBroadcast, chatBroadcast, privacyType) => {
  // TODO: combine duplicate code with TopBarMenu
  // Initialize tooltips
  var tooltipMotK = false;
  var tooltipEncounter2 = false;
  var tooltipQuest2 = false;
  var tooltipIds = []
  var parseString = require('xml2js').parseString;
  parseString(xmlText, function (err, deckJSON) {
    if (!deckJSON) return;
    const sections = deckJSON.deck.section;

    var containsPlaytest = false;
    sections.forEach(section => {
      const cards = section.card;
      if (!cards) return;
      cards.forEach(card => {
        console.log("loadcard", card)
        const cardDbId = card['$'].id;
        var cardRow = cardDb[cardDbId];
        if (cardRow && cardRow["playtest"]) {
          containsPlaytest = true;
        }
      })
    })
    if (containsPlaytest && privacyType === "public"){
      alert("Cannot load a deck containing playtest cards in a public room.")
      return;
    }

    var loadList = [];
    sections.forEach(section => {
      const sectionName = section['$'].name;
      const cards = section.card;
      if (!cards) return;
      cards.forEach(card => {
        const cardDbId = card['$'].id;
        const quantity = parseInt(card['$'].qty);
        var cardRow = cardDb[cardDbId];
        if (!cardRow) {
          alert("Encountered unknown card ID for "+card["_"])
        } else if (card["_"].includes("MotK")) {
          tooltipMotK = true;
        } else {
          cardRow['deckgroupid'] = sectionToDeckGroupId(sectionName,playerN);
          if (cardRow['deckgroupid'] === "sharedEncounterDeck2") tooltipEncounter2 = true;
          if (cardRow['deckgroupid'] === "sharedQuestDeck2") tooltipQuest2 = true;
          cardRow['discardgroupid'] = sectionToDiscardGroupId(sectionName,playerN);
          if (cardRow['sides']['A']['keywords'].includes("Encounter")) cardRow['discardgroupid'] = "sharedEncounterDiscard";
          loadList.push({'cardRow': cardRow, 'quantity': quantity, 'groupId': sectionToLoadGroupId(sectionName,playerN)})
        }
      })
    })
    // Automate certain things after you load a deck, like Eowyn, Thurindir, etc.
    loadList = processLoadList(loadList, playerN);
    console.log("loadList", loadList);
    gameBroadcast("game_action", {action: "load_cards", options: {load_list: loadList}});
    chatBroadcast("game_update",{message: "loaded a deck."});
    processPostLoad(null, loadList, playerN, gameBroadcast, chatBroadcast);

    // Add to tooltips
    if (tooltipMotK) tooltipIds.push("tooltipMotK");
    if (tooltipEncounter2) tooltipIds.push("tooltipEncounter2");
    if (tooltipQuest2) tooltipIds.push("tooltipQuest2");
  })
  return tooltipIds;
}

export const checkAlerts = async () => {
  const res = await axios.get("/be/api/v1/alerts");
  if (res.data && res.data.message) {
      alert(res.data.message + " Time remaining: "+res.data.minutes_remaining + " minutes");
  }
}



export const onLoad = (
  options,
  redoStepsExist,
  gameBroadcast,
  chatBroadcast,
  dispatch,
) => { 
  // Make sure this only ever gets loaded once
  if (options?.loaded || redoStepsExist) return;
  dispatch(setLoaded(true));

  const ringsDbInfo = options?.ringsDbInfo;
  const deckToLoad = ringsDbInfo?.[0] || ringsDbInfo?.[1] || ringsDbInfo?.[2] || ringsDbInfo?.[3];
  const gameUi = store.getState()?.gameUi;

  if (deckToLoad) {
    // Load ringsdb decks by ids
    var numDecks = 1;
    for (var i=1; i<=4; i++) {
      const playerI = "player"+i;
      if (!ringsDbInfo[i-1]) continue;
      numDecks = i;
      const deckType = ringsDbInfo[i-1].type;
      const deckId = ringsDbInfo[i-1].id;
      const deckDomain = ringsDbInfo[i-1].domain;
      loadRingsDb(gameUi, playerI, deckDomain, deckType, deckId, gameBroadcast, chatBroadcast, dispatch);

    }
    if (numDecks>1 && numDecks<=4) {
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["numPlayers", numDecks]]}});
      chatBroadcast("game_update", {message: "set the number of players to: " + numDecks});
    }
    // Loop over decks complete
  } // End if ringsDb
  // Shuffle all decks if setting was set
  if (options["loadShuffle"]) {
    // Turn off trigger
    const updates = [["options", "loadShuffle", false]];
    gameBroadcast("game_action", {action: "update_values", options: {updates: updates}});
    // TODO: fix this
    //dispatch(setValues({updates: updates}));
    // Object.keys(groupById).forEach((groupId) => {
    //   const group = groupById[groupId];
    //   if (group.type === "deck" && group.stackIds.length > 0) {
    //     gameBroadcast("game_action", {action: "shuffle_group", options: {group_id: groupId}})
    //     chatBroadcast("game_update", {message: " shuffled " + GROUPSINFO[groupId].name+"."})
    //   }
    // })
  }
}

export const loadRingsDb = (gameUi, playerI, ringsDbDomain, ringsDbType, ringsDbId, gameBroadcast, chatBroadcast, dispatch) => {
  chatBroadcast("game_update",{message: "is loading a deck from RingsDb..."});
  // Set up tooltips
  var tooltipMotK = false;
  const urlBase = ringsDbDomain === "test" ? "https://test.ringsdb.com/api/" : "https://www.ringsdb.com/api/"
  const url = ringsDbType === "decklist" ? urlBase+"public/decklist/"+ringsDbId+".json" : urlBase+"oauth2/deck/load/"+ringsDbId;
  console.log("ringsdb fetching", url);
  fetch(url)
  .then(response => response.json())
  .then((jsonData) => {
    // jsonData is parsed json object received from url
    console.log("ringsdb json", jsonData);  
    console.log("ringsdb delay",gameBroadcast)   

    const slots = jsonData.slots;
    const sideslots = jsonData.sideslots;
    var loadList = [];
    var fetches = [];
    Object.keys(slots).forEach((slot, slotIndex) => {
      const quantity = slots[slot];
      const slotUrl = urlBase+"public/card/"+slot+".json"
      fetches.push(fetch(slotUrl)
        .then(response => response.json())
        .then((slotJsonData) => {
          // jsonData is parsed json object received from url
          var cardRow = cardDb[slotJsonData.octgnid];
          if (slotJsonData.name.includes("MotK")) {
            tooltipMotK = true;
          } else if (cardRow) {
            const type = slotJsonData.type_name;
            const loadGroupId = (type === "Hero" || type === "Contract" || type === "Other") ? playerI+"Play1" : playerI+"Deck";
            cardRow['deckgroupid'] = playerI+"Deck";
            cardRow['discardgroupid'] = playerI+"Discard";
            if (cardRow['sides']['A']['keywords'].includes("Encounter")) cardRow['discardgroupid'] = "sharedEncounterDiscard";
            loadList.push({'cardRow': cardRow, 'quantity': quantity, 'groupId': loadGroupId});
          } else {
            alert("Encountered unknown card ID for "+slotJsonData.name)
          }
        })
        .catch((error) => {
          // handle your errors here
          console.error("Could not find card", slot);
        })
      )
    })
    Object.keys(sideslots).forEach((slot, slotIndex) => {
      const quantity = sideslots[slot];
      const slotUrl = urlBase+"public/card/"+slot+".json"
      fetches.push(fetch(slotUrl)
        .then(response => response.json())
        .then((slotJsonData) => {
          // jsonData is parsed json object received from url
          var cardRow = cardDb[slotJsonData.octgnid];
          if (cardRow) {
            const loadGroupId = playerI+"Sideboard";
            cardRow['deckgroupid'] = playerI+"Deck";
            cardRow['discardgroupid'] = playerI+"Discard";
            if (cardRow['sides']['A']['keywords'].includes("Encounter")) cardRow['discardgroupid'] = "sharedEncounterDiscard";
            loadList.push({'cardRow': cardRow, 'quantity': quantity, 'groupId': loadGroupId});
          } else {
            alert("Encountered unknown card ID for "+slotJsonData.name)
          }
        })
        .catch((error) => {
          // handle your errors here
          console.error("Could not find card", slot);
        })
      )
    })
    Promise.all(fetches).then(function() {
      // Automate certain things after you load a deck, like Eowyn, Thurindir, etc.
      loadList = processLoadList(loadList, playerI);
      gameBroadcast("game_action", {action: "load_cards", options: {load_list: loadList, for_player_n: playerI}});
      chatBroadcast("game_update",{message: "loaded a deck."});
      processPostLoad(gameUi, loadList, playerI, gameBroadcast, chatBroadcast);
      // Add to tooltips
      if (setTooltipIds) {
        var tooltipIds = []
        if (tooltipMotK) tooltipIds.push("tooltipMotK");
        dispatch(setTooltipIds(tooltipIds));
      }
    });
  })
  .catch((error) => {
    // handle your errors here
    alert("Error loading deck. If you are attempting to load an unpublished deck, make sure you have link sharing turned on in your RingsDB profile settings.")
  })
}
