import React, { useContext, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from "react-router-dom";
import useProfile from "../../../../hooks/useProfile";
import store from "../../../../store";
import { getCardByGroupIdStackIndexCardIndex, getSideAName, getPlayerCommitted, loadRingsDb, playerNToPlayerIndex, processLoadList, processPostLoad, shuffle } from "../functions/helpers";
import { flatListOfCards, functionOnMatchingCards, listOfMatchingCards } from "../../../engine/functions/flatListOfCards";
import { loadDeckFromXmlText, getRandomIntInclusive } from "../functions/helpers";
import { loadDeckFromModeAndId } from "./SpawnQuestModal";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setCardSizeFactor, setLoaded, setRandomNumBetween, setShowModal, setTouchAction, setTouchMode } from "../../../store/playerUiSlice";
import { useGameL10n } from "../../../../hooks/useGameL10n";
import BroadcastContext from "../../../../contexts/BroadcastContext";

export const TopBarMenu = React.memo(({}) => {
  const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
  const myUser = useProfile();
  const myUserID = myUser?.id;
  const history = useHistory();
  const l10n = useGameL10n();

  const createdBy = useSelector(state => state.gameUi?.createdBy);
  const options = useSelector(state => state.gameUi?.game?.options);
  const ringsDbInfo = options?.ringsDbInfo;
  const round = useSelector(state => state.gameUi?.game.roundNumber);
  const isHost = myUserID === createdBy;  
  const playerN = useSelector(state => state?.playerUi?.playerN);
  const cardsPerRound = useSelector(state => state.gameUi?.game.playerData[playerN]?.cardsDrawn);
  const cardSizeFactor = useSelector(state => state?.playerUi?.cardSizeFactor);
  const randomNumBetween = useSelector(state => state?.playerUi?.randomNumBetween);
  
  const dispatch = useDispatch();
  const inputFileDeck = useRef(null);
  const inputFileGame = useRef(null);
  const inputFileCustom = useRef(null);
  console.log("Rendering TopBarMenu");

  const handleMenuClick = (data) => {
    if (!playerN) {
      alert("Please sit at the table first.");
      return;
    }
    if (data.action === "clear_table") {
      // Mark status
      chatBroadcast("game_update", {message: "marked game as "+data.state+"."});
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["victoryState", data.state]]}});
      // Save replay
      if (round > 0) {
        gameBroadcast("game_action", {action: "save_replay", options: {}});
        chatBroadcast("game_update",{message: "saved the replay to their profile."});
      }
      // Reset game
      gameBroadcast("game_action", {action: "reset_game", options: {}});
      chatBroadcast("game_update", {message: "reset the game."});
    } else if (data.action === "close_room") {
      // Mark status
      chatBroadcast("game_update", {message: "marked game as "+data.state+"."});
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["victoryState", data.state]]}});
      // Save replay
      if (round > 0) {
        gameBroadcast("game_action", {action: "save_replay", options: {}});
        chatBroadcast("game_update",{message: "saved the replay to their profile."});
      }
      // Close room
      history.push("/profile");
      chatBroadcast("game_update", {message: "closed the room."});
      gameBroadcast("close_room", {});
    } else if (data.action === "reload_game") {
      const newOptions = {...options, loaded: false};
      const resetData = {action: "clear_table", state: data.state};
      handleMenuClick(resetData);
      dispatch(setLoaded(false));
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["options", newOptions]]}})
      if (options.questModeAndId) loadDeckFromModeAndId(options.questModeAndId, playerN, gameBroadcast, chatBroadcast, options["privacyType"]);
    } else if (data.action === "load_deck") {
      loadFileDeck();
    } else if (data.action === "load_ringsdb") {
      const ringsDbUrl = prompt("Paste full RingsDB URL","");
      if (!ringsDbUrl) {
        alert("Invalid URL");
        return;
      }
      if (ringsDbUrl.includes("/fellowship/")) {
        alert("Fellowship import not yet supported.");
        return;
      }
      const ringsDbDomain = ringsDbUrl.includes("test.ringsdb.com") ? "test" : "ringsdb";
      var ringsDbType;
      if (ringsDbUrl.includes("/decklist/")) ringsDbType = "decklist";
      else if (ringsDbUrl.includes("/deck/")) ringsDbType = "deck";
      if (!ringsDbType) {
        alert("Invalid URL");
        return;
      }
      var splitUrl = ringsDbUrl.split( '/' );
      const typeIndex = splitUrl.findIndex((e) => e === ringsDbType)
      if (splitUrl && splitUrl.length <= typeIndex + 2) {
        alert("Invalid URL");
        return;
      }
      const ringsDbId = splitUrl[typeIndex + 2];
      const playerIndex = playerNToPlayerIndex(playerN);
      var newRingsDbInfo;
      if (ringsDbInfo) newRingsDbInfo = [...ringsDbInfo];
      else newRingsDbInfo = [null, null, null, null];
      newRingsDbInfo[playerIndex] = {id: ringsDbId, type: ringsDbType, domain: ringsDbDomain};
      const newOptions = {...options, ringsDbInfo: newRingsDbInfo, loaded: true}
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["options", newOptions]]}});
      const gameUi = store.getState()?.gameUi;
      loadRingsDb(gameUi, playerN, ringsDbDomain, ringsDbType, ringsDbId, gameBroadcast, chatBroadcast, dispatch);
    } else if (data.action === "unload_my_deck") {
      // Delete all cards you own
      chatBroadcast("game_update",{message: "unloaded their deck."});
      gameBroadcast("game_action", {
        action: "action_on_matching_cards", 
        options: {
            criteria:[["owner", playerN]], 
            action: "delete_card", 
        }
      });
      // Set threat to 00
      chatBroadcast("game_update",{message: "reset their deck."});
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["playerData", playerN, "threat", 0]]}});
      // Set RingsDb info for this player to null
      const playerIndex = playerNToPlayerIndex(playerN);
      var newRingsDbInfo;
      if (ringsDbInfo) newRingsDbInfo = [...ringsDbInfo];
      else newRingsDbInfo = [null, null, null, null];
      newRingsDbInfo[playerIndex] = null;
      const newOptions = {...options, ringsDbInfo: newRingsDbInfo}
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["options", newOptions]]}});
    } else if (data.action === "unload_encounter_deck") {
      // Delete all cards from encounter
      chatBroadcast("game_update",{message: "unloaded the encounter deck."});
      gameBroadcast("game_action", {
        action: "action_on_matching_cards", 
        options: {
            criteria:[["owner", "shared"]], 
            action: "delete_card", 
        }
      });
      // Set quest id to null
      const newOptions = {...options, questModeAndId: null};
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["options", newOptions]]}});
    } else if (data.action === "random_coin") {
      const result = getRandomIntInclusive(0,1);
      if (result) chatBroadcast("game_update",{message: "flipped heads."});
      else chatBroadcast("game_update",{message: "flipped tails."});
    } else if (data.action === "random_number") {
      const max = parseInt(prompt("Random number between 1 and...",randomNumBetween));
      if (max>=1) {
        dispatch(setRandomNumBetween(max))
        const result = getRandomIntInclusive(1,max);
        chatBroadcast("game_update",{message: "chose a random number (1-"+max+"): "+result});
      }
    } else if (data.action === "cards_per_round") {
      const num = parseInt(prompt("Set the number of cards drawn during resource phase:",cardsPerRound));
      if (num>=0) {
        gameBroadcast("game_action", {action: "update_values", options: {updates: [["playerData", playerN, "cardsDrawn", num]]}});
        chatBroadcast("game_update",{message: "set the number of cards they draw during the resource phase to "+num+"."});
      }
    } else if (data.action === "adjust_card_size") {
      const num = parseInt(prompt("Adjust the apparent card size for yourself only (10-1000):",Math.round(cardSizeFactor*100)));
      if (num>=10 && num<=1000) {
        dispatch(setCardSizeFactor(num/100));
      }
    } else if (data.action === "spawn_existing") {
      dispatch(setShowModal("card"));
    } else if (data.action === "spawn_custom") {
      dispatch(setShowModal("custom"));
    } else if (data.action === "spawn_quest") {
      dispatch(setShowModal("quest"));
    } else if (data.action === "spawn_campaign") {
      dispatch(setShowModal("campaign"));
    } else if (data.action === "download") {
      downloadGameAsJson();
    } else if (data.action === "export_cards") {
      exportCardsAsTxt();
    } else if (data.action === "load_game") {
      loadFileGame();
    } else if (data.action === "load_custom") {
      loadFileCustom();
    } else if (data.action === "num_players") {
      const num = data.value;
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["numPlayers", num]]}});
      chatBroadcast("game_update", {message: "set the number of players to: " + num});
    } else if (data.action === "layout") {
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["layout", data.value]]}});
    } else if (data.action === "quest_mode") {
      gameBroadcast("game_action", {action: "update_values", options: {updates: [["questMode", data.mode]]}});
      chatBroadcast("game_update", {message: "set the quest mode to " + data.mode + "."});
      const state = store.getState();
      const gameUi = state.gameUi;
      for (var i=1; i<=gameUi.game.numPlayers; i++) {
        const playerI = "player"+i;      
        const totalCommitted = getPlayerCommitted(gameUi, data.mode, playerI);
        gameBroadcast("game_action", {action: "update_values", options: {updates: [["playerData", playerI, "willpower", totalCommitted]]}});
      }

    } else if (data.action === "escape_from_mount_gram") {
      const state = store.getState();
      const gameUi = state.gameUi;
      const game = gameUi.game;
      const questModeAndId = game?.options?.questModeAndId;
      if (!questModeAndId || !questModeAndId.includes("05.5")) {
        alert("Escape from Mount Gram not detected.")
        return;
      }      
      const result = window.confirm("The function will set up each player's capture deck, add 2 resources to each hero, draw new starting hands of 3 cards, and set new threat levels. Before running this function, each player should flip each hero they control that is not their starting hero facedown. Continue?")
      if (!result) return;
      for (var i=1; i<=game.numPlayers; i++) {
        const playerI = "player"+i;
        const hand = game.groupById[playerN+"Hand"];
        const handSize = hand.stackIds.length;
        // Shuffle hand into deck
        gameBroadcast("game_action", {action: "move_stacks", options: {orig_group_id: playerI+"Hand", dest_group_id: playerI+"Deck", top_n: handSize, position: "shuffle"}})
        // Move allies to capture deck
        gameBroadcast("game_action", {
          action: "action_on_matching_cards", 
          options: {
            criteria:[["controller", playerI], ["sides", "A", "type", "Ally"]], 
            action: "move_card", 
            options: {dest_group_id: playerI+"Deck2", dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}
          }
        })
        // Move Items to capture deck
        gameBroadcast("game_action", {
          action: "action_on_matching_cards", 
          options: {
            criteria:[["controller", playerI], ["sides", "A", "traits", "Item."]], 
            action: "move_card", 
            options: {dest_group_id: playerI+"Deck2", dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}
          }
        })
        // Move Mounts to capture deck
        gameBroadcast("game_action", {
          action: "action_on_matching_cards", 
          options: {
            criteria:[["controller", playerI], ["sides", "A", "traits", "Mount."]], 
            action: "move_card", 
            options: {dest_group_id: playerI+"Deck2", dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}
          }
        })
        // Move Artifacts to capture deck
        gameBroadcast("game_action", {
          action: "action_on_matching_cards", 
          options: {
            criteria:[["controller", playerI], ["sides", "A", "traits", "Artifact."]], 
            action: "move_card", 
            options: {dest_group_id: playerI+"Deck2", dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}
          }
        })
        // Locate facedown heroes
        const faceDownHeroes = listOfMatchingCards(gameUi, [["controller",playerI],["sides","A","type","Hero"],["currentSide","B"]])
        if (faceDownHeroes.length > 0) {
          // Choose set aside hero
          const setAsideHeroIndex = getRandomIntInclusive(0, faceDownHeroes.length-1);        
          const setAsideHero = faceDownHeroes[setAsideHeroIndex];
          // Shuffle other heroes into capture deck
          for (var j=0; j<faceDownHeroes.length; j++) {
            if (j===setAsideHeroIndex) continue;
            gameBroadcast("game_action", {action: "move_card", options: {card_id: faceDownHeroes[j].id, dest_group_id: playerI+"Deck2", dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}})        
          }
          gameBroadcast("game_action", {action: "shuffle_group", options: {group_id: playerI+"Deck2"}})   
          // Move set aside hero to top of capture deck
          gameBroadcast("game_action", {action: "move_card", options: {card_id: setAsideHero.id, dest_group_id: playerI+"Deck2", dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}})
        }
        const remainingHeroes = listOfMatchingCards(gameUi, [["controller",playerI],["sides","A","type","Hero"],["currentSide","A"]]);
        if (remainingHeroes.length === 1) {
          // Set starting threat
          const remainingHero = remainingHeroes[0];
          gameBroadcast("game_action", {action: "update_values", options: {updates: [["playerData", playerI, "threat", remainingHero["sides"]["A"]["cost"]]]}});
        }
        // Draw 3 cards
        gameBroadcast("game_action", {action: "move_stacks", options: {orig_group_id: playerI+"Deck", dest_group_id: playerI+"Hand", top_n: 3, position: "top"}})
      }
      // Add a resource to each hero
      gameBroadcast("game_action", {
        action: "action_on_matching_cards", 
        options: {
            criteria:[["sides","sideUp","type","Hero"], ["groupType","play"]], 
            action: "increment_token", 
            options: {token_type: "resource", increment: 2}
        }
      });
      alert("Complete! Players can find their capture decks under View > Player X > Player X Deck 2.")
    } else if (data.action === "to_catch_an_orc") {
      const state = store.getState();
      const gameUi = state.gameUi;
      const game = gameUi.game;
      const questModeAndId = game?.options?.questModeAndId;
      if (!questModeAndId || !questModeAndId.includes("04.2")) {
        alert("To Catch an Orc not detected.")
        return;
      }      
      const result = window.confirm("The function will set up each player's out-of-play deck which can be found under View > Player X > Player X Deck 2. Continue?")
      if (!result) return;
      const shuffledPlayersIds = shuffle(Array.from({length: game.numPlayers}, (_, i) => i + 1))
      alert(shuffledPlayersIds)
      const guards = listOfMatchingCards(gameUi, [["sides","A","name","Mugash's Guard"]]);
      if (guards.length < game.numPlayers-1) {
        alert("Setup failed, not enough Mugash's Guards found.");
        return;
      }
      for (var i=0; i<game.numPlayers; i++) {
        const playerI = "player"+shuffledPlayersIds[i];
        const deck = game.groupById[playerI+"Deck"];
        if (deck.stackIds.length < 20) {
          alert("Setup failed, "+playerI+" does not have enough cards in their deck.");
          return;
        }
        // Move 20 cards to out-of-play deck
        gameBroadcast("game_action", {action: "move_stacks", options: {orig_group_id: playerI+"Deck", dest_group_id: playerI+"Deck2", top_n: 20, position: "top"}})
        if (i === 0) {
          // Move Mugash
          gameBroadcast("game_action", {
            action: "action_on_matching_cards", 
            options: {
              criteria:[["sides", "A", "name", "Mugash"]], 
              action: "move_card", 
              options: {dest_group_id: playerI+"Deck2", dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}
            }
          })
        } else {
          const guard = guards[i-1];
          gameBroadcast("game_action", {action: "move_card", options: {card_id: guard.id, dest_group_id: playerI+"Deck2", dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: false}})
        }
        // Shuffle
        gameBroadcast("game_action", {action: "shuffle_group", options: {group_id: playerI+"Deck2"}})
      }
    } else if (data.action === "glittering_caves") {
      const state = store.getState();
      const gameUi = state.gameUi;
      const game = gameUi.game;
      const questModeAndId = game?.options?.questModeAndId;
      if (!questModeAndId || !questModeAndId.includes("A1.7")) {
        alert("The Glittering Caves not detected.")
        return;
      }
      const result = window.confirm("This function is meant to be used after the Caves Map has been set up so that all caves are connected. Continue?")
      if (!result) return;
      const searchStackIds = game.groupById["sharedEncounterDeck2"].stackIds;
      if (searchStackIds.length < 12) return;
      if (game.groupById["sharedExtra1"].stackIds.length < 4) return;
      if (game.groupById["sharedExtra2"].stackIds.length < 4) return;
      if (game.groupById["sharedExtra3"].stackIds.length < 4) return;
      const rightColNames = [
          getSideAName(getCardByGroupIdStackIndexCardIndex(game, "sharedExtra1", 3, 0)),
          getSideAName(getCardByGroupIdStackIndexCardIndex(game, "sharedExtra2", 3, 0)),
          getSideAName(getCardByGroupIdStackIndexCardIndex(game, "sharedExtra3", 3, 0)),
      ];
      const searchCards = []
      for (var id of searchStackIds) {
          const cardId = game.stackById[id].cardIds[0];
          const card = game.cardById[cardId]
          searchCards.push(card)
      }

      function getNRandomFromPositionCoordinates(n) {
          var positionCoordinates = [[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3]];
          var selectedPositionCoordinates = [];
          for (var i=0; i<n; i++) {
              var randomIndex = Math.floor(Math.random()*positionCoordinates.length);
              selectedPositionCoordinates.push(positionCoordinates.splice(randomIndex, 1)[0]);
          }
          return selectedPositionCoordinates;
      }

      // Deal clues
      const numResources = 2*game.numPlayers;
      const resourcePositionCoordinates = getNRandomFromPositionCoordinates(numResources);
      var rightSideSatisfied = false;
      for (var i=0; i<numResources; i++) {
          var coordinates = resourcePositionCoordinates[i];
          if (i === numResources - 1 && !rightSideSatisfied) {
              const indexCol = getRandomIntInclusive(2,3);
              const indexRow = getRandomIntInclusive(0,2);
              coordinates = [indexRow,indexCol];
          } else {
              if (coordinates[1] === 2 || coordinates[1] === 3) rightSideSatisfied = true;
              coordinates = resourcePositionCoordinates[i];
          }
          gameBroadcast("game_action", {action: "move_card", options: {card_id: searchCards[i].id, dest_group_id: "sharedExtra"+(coordinates[0]+1), dest_stack_index: coordinates[1], dest_card_index: 1, combine: true, preserve_state: true}})
      }

      // Attach 1 card to Helm's Horn
      // gameBroadcast("game_action", {action: "deal_x", options: {group_id: "sharedEncounterDeck2", dest_group_id: "sharedStaging", top_x: 1}});
      gameBroadcast("game_action", {action: "move_card", options: {card_id: searchCards[numResources].id, dest_group_id: "sharedSetAside", dest_stack_index: 0, dest_card_index: 0, combine: false, preserve_state: true}})        

      // Deal damage to positions
      for (var i=numResources+1; i<12; i++) {
          var mapCardName = searchCards[i]["sides"]["A"]["cornerText"];
          functionOnMatchingCards(gameUi, gameBroadcast, chatBroadcast, [["sides","A","name", mapCardName]], "increment_token", ["damage", 1] )
      }

      // Shuffle in positions
      gameBroadcast("game_action", {action: "move_stacks", options: {orig_group_id: "sharedEncounterDeck2", dest_group_id: "sharedEncounterDeck", top_n: 11-numResources,  position: "shuffle"}})

      // Place player tokens
      functionOnMatchingCards(gameUi, gameBroadcast, chatBroadcast, [["groupId","sharedExtra1"],["stackIndex",0]], "increment_token", ["attack", 1] )
      if (game.numPlayers > 1) functionOnMatchingCards(gameUi, gameBroadcast, chatBroadcast, [["groupId","sharedExtra1"],["stackIndex",0]], "increment_token", ["defense", 1] )
      if (game.numPlayers > 2) functionOnMatchingCards(gameUi, gameBroadcast, chatBroadcast, [["groupId","sharedExtra1"],["stackIndex",0]], "increment_token", ["hitPoints", 1] )
      if (game.numPlayers > 3) functionOnMatchingCards(gameUi, gameBroadcast, chatBroadcast, [["groupId","sharedExtra1"],["stackIndex",0]], "increment_token", ["time", 1] )
      functionOnMatchingCards(gameUi, gameBroadcast, chatBroadcast, [["groupId","sharedExtra3"],["stackIndex",3]], "increment_token", ["threat", 1] )

    } else if (data.action === "fortress_of_nurn") {
      const state = store.getState();
      const gameUi = state.gameUi;
      const game = gameUi.game;
      const questModeAndId = game?.options?.questModeAndId;
      if (!questModeAndId || !questModeAndId.includes("09.9")) {
        alert("The Fortress of Nurn not detected.")
        return;
      }
      const result = window.confirm("Perform automated setup for this quest? (Make sure all player decks are loaded first, and all mulligans have been taken.)")
      if (!result) return;
      for (var i=1; i<=game.numPlayers; i++) {
        const playerI = "player"+i;
        for (var j=0; j<5; j++) {
          gameBroadcast("game_action", {action: "deal_x", options: {group_id: playerI+"Deck", dest_group_id: playerI+"Engaged", top_x: 8}});
        }
      }
      const eDeck2StackIds = game.groupById["sharedEncounterDeck2"].stackIds;
      for (var i=0; i<4; i++) {
        gameBroadcast("game_action", {action: "move_stack", options: {stack_id: eDeck2StackIds[i], dest_group_id: "sharedStaging", dest_stack_index: i+1, combine: true, preserve_state: false}})
      }
    }
  }

  const loadFileDeck = () => {
    inputFileDeck.current.click();
  }

  const loadFileGame = () => {
    inputFileGame.current.click();
  }

  const loadFileCustom = () => {
    inputFileCustom.current.click();
  }

  const loadDeck = async(event) => {
    event.preventDefault();
    const reader = new FileReader();
    reader.onload = async (event) => { 
      const xmlText = (event.target.result)
      loadDeckFromXmlText(xmlText, playerN, gameBroadcast, chatBroadcast, options["privacyType"]);
    }
    reader.readAsText(event.target.files[0]);
    inputFileDeck.current.value = "";
  }

  const uploadGameAsJson = async(event) => {
    event.preventDefault();
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const gameObj = JSON.parse(event.target.result);
        if (gameObj) {
          //dispatch(setGame(gameObj));
          chatBroadcast("game_update", {message: "uploaded a game."});
          if (gameObj?.deltas?.length) {
            gameBroadcast("game_action", {action: "update_values", options: {updates: [[gameObj]], preserve_undo: true}})            
          } else {
            gameBroadcast("game_action", {action: "update_values", options: {updates: [[gameObj]]}})
            gameBroadcast("game_action", {action: "update_values", options: {updates: [["replayStep", 1]]}})
          }
        }
      } catch(e) {
          alert("Game must be a valid JSON file."); // error in the above string (in this case, yes)!
      }
    }
    reader.readAsText(event.target.files[0]);
    inputFileGame.current.value = "";
  }

  const uploadCustomCards = async(event) => {
    event.preventDefault();
    const reader = new FileReader();
    reader.onload = async (event) => {
      //try {
        console.log("target result", event.target.result);
        var loadList = JSON.parse(event.target.result);
        console.log("loadlist", loadList);
        //if (loadList) {
          loadList = processLoadList(loadList, playerN);
          gameBroadcast("game_action", {action: "load_cards", options: {load_list: loadList}});
          chatBroadcast("game_update",{message: "loaded a deck."});
          processPostLoad(null, loadList, playerN, gameBroadcast, chatBroadcast);
        //}
    //  } catch(e) {
      //    alert("Custom cards must be a valid text file. Check out the tutorial on YouTube.");
      //}
    }
    reader.readAsText(event.target.files[0]);
    inputFileCustom.current.value = "";
  }

  const downloadGameAsJson = () => {
    const state = store.getState();
    const exportObj = state.gameUi.game;
    const exportName = state.gameUi.roomName;
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    chatBroadcast("game_update", {message: "downloaded the game."});
  }

  const exportCardsAsTxt = () => {
    const state = store.getState();
    const game = state.gameUi.game;
    const cardList = flatListOfCards(game);
    const exportList = [];
    for (var card of cardList) {
      const sideA = card.sides.A;
      const sideB = card.sides.B;
      const cardRow = {
        "cardencounterset": card.cardEncounterSet,
        "sides": {
          "A": {
            "printname": sideA.printName,
            "sphere": sideA.sphere,
            "text": sideA.text,
            "willpower": sideA.willpower,
            "hitpoints": sideA.hitPoints,
            "shadow": sideA.shadow,
            "engagementcost": sideA.engagementCost,
            "traits": sideA.traits,
            "keywords": sideA.keywords,
            "type": sideA.type,
            "victorypoints": sideA.victoryPoints,
            "cost": sideA.cost,
            "name": sideA.name,
            "questpoints": sideA.questPoints,
            "attack": sideA.attack,
            "unique": sideA.unique,
            "defense": sideA.defense,
            "threat": sideA.threat,
            "customimgurl": sideA.customImgUrl,
          },
          "B": {
            "printname": sideB.printName,
            "sphere": sideB.sphere,
            "text": sideB.text,
            "willpower": sideB.willpower,
            "hitpoints": sideB.hitPoints,
            "shadow": sideB.shadow,
            "engagementcost": sideB.engagementCost,
            "traits": sideB.traits,
            "keywords": sideB.keywords,
            "type": sideB.type,
            "victorypoints": sideB.victoryPoints,
            "cost": sideB.cost,
            "name": sideB.name,
            "questpoints": sideB.questPoints,
            "attack": sideB.attack,
            "unique": sideB.unique,
            "defense": sideB.defense,
            "threat": sideB.threat,
            "customimgurl": sideB.customImgUrl,
          }
        },
        "cardquantity": card.cardQuantity,
        "cardsetid": card.cardSetId,
        "cardpackname": card.cardPackName,
        "cardid": card.cardDbId,
        "cardnumber": card.cardNumber,
        "deckgroupid": card.deckGroupId,
        "discardgroupid": card.discardGroupId,
      }
      exportList.push({cardRow: cardRow, quantity: 1, groupId: card.groupId})
    }
    const exportName = state.gameUi.roomName+"-cards";
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportList, null, 2));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".txt");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    chatBroadcast("game_update", {message: "exported all the cards."});
  }

  return(
    <li key={"Menu"}><div className="h-full flex items-center justify-center select-none">{l10n("Menu")}</div>
      <ul className="second-level-menu">
        {isHost &&
          <li key={"numPlayers"}>
              {l10n("Player count")}
              <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
            <ul className="third-level-menu">
                <li key={"numPlayers1"} onClick={() => handleMenuClick({action:"num_players", value: 1})}>1</li>
                <li key={"numPlayers2"} onClick={() => handleMenuClick({action:"num_players", value: 2})}>2</li>
                <li key={"numPlayers3"} onClick={() => handleMenuClick({action:"num_players", value: 3})}>3</li>
                <li key={"numPlayers4"} onClick={() => handleMenuClick({action:"num_players", value: 4})}>4</li>
            </ul>
          </li>
        }
        {isHost &&
          <li key={"layout"}>
              {l10n("Layout")}
              <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
            <ul className="third-level-menu">
                <li key={"standard"} onClick={() => handleMenuClick({action:"layout", value: "standard"})}>{l10n("Standard")}</li>
                <li key={"extra"} onClick={() => handleMenuClick({action:"layout", value: "extra"})}>{l10n("Extra staging areas / map")}</li>
            </ul>
          </li>                
        }
        <li key={"touch_mode"}>
            {l10n("Touch/mouse mode")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
          <ul className="third-level-menu">
              <li key={"touch_enabled"} onClick={() => dispatch(setTouchMode(true))}>{l10n("Enable")}</li>
              <li key={"touch_disabled"} onClick={() => {dispatch(setTouchMode(false)) && dispatch(setTouchAction(null))}}>{l10n("Disable")}</li>
          </ul>
        </li> 
        <li key={"load"}>
            {l10n("Load")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
          <ul className="third-level-menu">
            <li key={"load_quest"} onClick={() => handleMenuClick({action:"spawn_quest"})}>{l10n("Load quest")}</li>
            <li key={"load_campaign"} onClick={() => handleMenuClick({action:"spawn_campaign"})}>{l10n("Load campaign cards")}</li>
            <li key={"load_deck"} onClick={() => handleMenuClick({action:"load_deck"})}>
              {l10n("Load deck (OCTGN file)")}
              <input type='file' id='file' ref={inputFileDeck} style={{display: 'none'}} onChange={loadDeck} accept=".o8d"/>
            </li>
            <li key={"load_ringsdb"} onClick={() => handleMenuClick({action:"load_ringsdb"})}>
              {l10n("Load deck (RingsDB URL)")}
            </li>
            <li key={"load_game"} onClick={() => handleMenuClick({action:"load_game"})}>
              {l10n("Load game (.json)")}
              <input type='file' id='file' ref={inputFileGame} style={{display: 'none'}} onChange={uploadGameAsJson} accept=".json"/>
            </li>
            <li key={"load_custom"} onClick={() => handleMenuClick({action:"load_custom"})}>
              {l10n("Load custom cards (.txt)")}
              <input type='file' id='file' ref={inputFileCustom} style={{display: 'none'}} onChange={uploadCustomCards} accept=".txt"/>
            </li>
          </ul>
        </li> 
        <li key={"unload"}>
            {l10n("Unload")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
          <ul className="third-level-menu">        
            <li key={"unload_my_deck"} onClick={() => handleMenuClick({action:"unload_my_deck"})}>{l10n("Unload my deck")}</li>
            <li key={"unload_encounter_deck"} onClick={() => handleMenuClick({action:"unload_encounter_deck"})}>{l10n("Unload encounter")}</li>
          </ul>
        </li>
        <li key={"spawn"}>
            {l10n("Spawn card")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
          <ul className="third-level-menu">
            <li key={"spawn_existing"} onClick={() => handleMenuClick({action:"spawn_existing"})}>{l10n("From the card pool")}</li>
            <li key={"spawn_custom"} onClick={() => handleMenuClick({action:"spawn_custom"})}>{l10n("Create your own card")}</li>
          </ul>
        </li> 
        <li key={"random"}>
            {l10n("Random")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
          <ul className="third-level-menu">
            <li key={"random_coin"} onClick={() => handleMenuClick({action:"random_coin"})}>{l10n("Coin")}</li>
            <li key={"random_number"} onClick={() => handleMenuClick({action:"random_number"})}>{l10n("Number")}</li>
          </ul>
        </li> 
        <li key={"options"}>
            {l10n("Options")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
          <ul className="third-level-menu">
            <li key={"adjust_card_size"} onClick={() => handleMenuClick({action:"adjust_card_size"})}>{l10n("Adjust card size")}</li>
            <li key={"cards_per_round"} onClick={() => handleMenuClick({action:"cards_per_round"})}>{l10n("Cards per round")}</li>
            <li key={"quest_mode_battle"} onClick={() => handleMenuClick({action:"quest_mode", mode: "Battle"})}>{l10n("Battle quest")}</li>
            <li key={"quest_mode_siege"} onClick={() => handleMenuClick({action:"quest_mode", mode: "Siege"})}>{l10n("Siege quest")}</li>
            <li key={"quest_mode_normal"} onClick={() => handleMenuClick({action:"quest_mode", mode: "Normal"})}>{l10n("Normal quest")}</li>
          </ul>
        </li> 
        <li key={"advanced_functions"}>
            {l10n("Special Functions")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
          <ul className="third-level-menu">
            <li key={"to_catch_an_orc"} onClick={() => handleMenuClick({action:"to_catch_an_orc"})}>{l10n("To Catch an Orc Setup")}</li>
            <li key={"escape_from_mount_gram"} onClick={() => handleMenuClick({action:"escape_from_mount_gram"})}>{l10n("Escape from Mount Gram Setup")}</li>
            <li key={"fortress_of_nurn"} onClick={() => handleMenuClick({action:"fortress_of_nurn"})}>{l10n("The Fortress of Nurn Setup")}</li>
            <li key={"glittering_caves"} onClick={() => handleMenuClick({action:"glittering_caves"})}>{l10n("Glittering Caves Clues")}</li>
          </ul>
        </li> 
        <li key={"download"}>
            {l10n("Download")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
          <ul className="third-level-menu">        
            <li key={"download"} onClick={() => handleMenuClick({action:"download"})}>{l10n("Game state (.json)")}</li>
            <li key={"export_cards"} onClick={() => handleMenuClick({action:"export_cards"})}>{l10n("Export cards (.txt)")}</li>
          </ul>
        </li>
        {isHost &&
          <li key={"reload"}>
              {l10n("Reload decks")}
              <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
            <ul className="third-level-menu">
              <li key={"reload_victory"} onClick={() => handleMenuClick({action:"reload_game", state: "victory"})}>{l10n("Mark as victory")}</li>
              <li key={"reload_defeat"} onClick={() => handleMenuClick({action:"reload_game", state: "defeat"})}>{l10n("Mark as defeat")}</li>
              <li key={"reload_incomplete"} onClick={() => handleMenuClick({action:"reload_game", state: "incomplete"})}>{l10n("Mark as incomplete")}</li>
            </ul>
          </li> 
        }    
        {isHost &&
          <li key={"reset"}>
            {l10n("Clear table")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
            <ul className="third-level-menu">
              <li key={"reset_victory"} onClick={() => handleMenuClick({action:"clear_table", state: "victory"})}>{l10n("Mark as victory")}</li>
              <li key={"reset_defeat"} onClick={() => handleMenuClick({action:"clear_table", state: "defeat"})}>{l10n("Mark as defeat")}</li>
              <li key={"reset_incomplete"} onClick={() => handleMenuClick({action:"clear_table", state: "incomplete"})}>{l10n("Mark as incomplete")}</li>
            </ul>
          </li> 
        }      
        {isHost &&
          <li key={"shut_down"}>
            {l10n("Close room")}
              <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
            <ul className="third-level-menu">
              <li key={"close_victory"} onClick={() => handleMenuClick({action:"close_room", state: "victory"})}>{l10n("Mark as victory")}</li>
              <li key={"close_defeat"} onClick={() => handleMenuClick({action:"close_room", state: "defeat"})}>{l10n("Mark as defeat")}</li>
              <li key={"close_incomplete"} onClick={() => handleMenuClick({action:"close_room", state: "incomplete"})}>{l10n("Mark as incomplete")}</li>
            </ul>
          </li> 
        }
      </ul>
    </li>
  )
})