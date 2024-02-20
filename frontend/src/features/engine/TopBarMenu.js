import React, { useContext, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from "react-router-dom";
import useProfile from "../../hooks/useProfile";
import store from "../../store";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setLoaded, setRandomNumBetween, setShowModal, setTouchAction, setTouchMode, setShowDeveloper } from "../store/playerUiSlice";
import { useGameL10n } from "./hooks/useGameL10n";
import BroadcastContext from "../../contexts/BroadcastContext";
import { useGameDefinition } from "./hooks/useGameDefinition";
import { useDoActionList } from "./hooks/useDoActionList";
import { useSiteL10n } from "../../hooks/useSiteL10n";
import { getRandomIntInclusive, keysDiv } from "./functions/common";
import { useImportLoadList } from "./hooks/useImportLoadList";
import { useImportViaUrl } from "./hooks/useImportViaUrl";
import { useIsHost } from "./hooks/useIsHost";


export const TopBarMenu = React.memo(({}) => {
  const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
  const history = useHistory();
  const gameL10n = useGameL10n();
  const siteL10n = useSiteL10n();
  const gameDef = useGameDefinition();
  const doActionList = useDoActionList();
  const loadList = useImportLoadList();
  const importViaUrl = useImportViaUrl();

  const isHost = useIsHost();
  const playerN = useSelector(state => state?.playerUi?.playerN);
  const randomNumBetween = useSelector(state => state?.playerUi?.randomNumBetween);
  
  const dispatch = useDispatch();
  const inputFileDeck = useRef(null);
  const inputFileGame = useRef(null);
  const inputFileGameDef = useRef(null);
  const inputFileCustom = useRef(null);
  console.log("Rendering TopBarMenu");

  const handleMenuClick = (data) => {
    if (!playerN) {
      alert("Please sit at the table first.");
      return;
    }
    if (data.action === "clear_table") {
      // Mark status
      //doActionList(data.actionList);
      // Save replay
      //gameBroadcast("game_action", {action: "save_replay", options: {player_ui: store.getState().playerUi}});
      // Reset game
      gameBroadcast("game_action", {action: "reset_game", options: {player_ui: store.getState().playerUi, action_list: data.actionList}});
      //doActionList(["LOG", "$ALIAS_N", " reset the game."]);
    } else if (data.action === "close_room") {
      // Mark status
      //doActionList(data.actionList);
      // Save replay
      gameBroadcast("game_action", {action: "close_room", options: {player_ui: store.getState().playerUi, action_list: data.actionList}});
      // Close room
      history.push("/profile");
      //doActionList(["LOG", "$ALIAS_N", " closed the room."]);
      gameBroadcast("close_room", {});
    } else if (data.action === "load_deck") {
      loadFileDeck();
    } else if (data.action === "load_url") {
      importViaUrl();
    } else if (data.action === "unload_my_deck") {
      const actionList = [
        ["FOR_EACH_KEY_VAL", "$CARD_ID", "$CARD", "$CARD_BY_ID", [
          ["COND",
            ["EQUAL", "$CARD.controller", "$PLAYER_N"],
            ["DELETE_CARD", "$CARD_ID"]
          ]
        ]],
        ["LOG", "$ALIAS_N", " deleted all their cards."]
      ]
      doActionList(actionList);
    } else if (data.action === "unload_shared_cards") {
      const actionList = [
        ["FOR_EACH_KEY_VAL", "$CARD_ID", "$CARD", "$CARD_BY_ID", [
          ["COND",
            ["EQUAL", "$CARD.controller", "shared"],
            ["DELETE_CARD", "$CARD_ID"]
          ]
        ]],
        ["LOG", "$ALIAS_N", " deleted all shared cards."]
      ]
      doActionList(actionList);
    } else if (data.action === "random_coin") {
      const result = getRandomIntInclusive(0,1);
      if (result) doActionList(["LOG", "$ALIAS_N", " flipped heads."]);
      else doActionList(["LOG", "$ALIAS_N", " flipped tails."]);
    } else if (data.action === "random_number") {
      const max = parseInt(prompt("Random number between 1 and...",randomNumBetween));
      if (max>=1) {
        dispatch(setRandomNumBetween(max))
        const result = getRandomIntInclusive(1,max);
        doActionList(["LOG", "$ALIAS_N", " chose a random number (1-"+max+"): "+result]);
      }
    } else if (data.action === "spawn_existing") {
      dispatch(setShowModal("card"));
    } else if (data.action === "spawn_custom") {
      dispatch(setShowModal("custom"));
    } else if (data.action === "developer_tools") {
      dispatch(setShowDeveloper(true));
    } else if (data.action === "spawn_deck") {
      dispatch(setShowModal("prebuilt_deck"));
    } else if (data.action === "download") {
      downloadGameAsJson();
    } else if (data.action === "load_game") {
      loadFileGame();
    } else if (data.action === "load_game_def") {
      loadFileGameDef();
    } else if (data.action === "load_custom") {
      loadFileCustom();
    }  else if (data.action === "layout") {
      if (data.playerI === "shared") {
        doActionList([
          ["LOG", "$ALIAS_N", " changed the layout for all players to "+gameL10n(data.value.label)+"."],
          ["SET_LAYOUT", "shared", data.value.layoutId],
          ["SET", "/numPlayers", data.value.numPlayers ? data.value.numPlayers : "$GAME.numPlayers"]
        ]);
      } else {
        doActionList([
          ["LOG", "$ALIAS_N", " changed the layout for themselves to "+gameL10n(data.value.label)+"."],
          ["SET_LAYOUT", playerN, data.value.layoutId]
        ]);
      }
    } 
  }

  const loadFileDeck = () => {
    inputFileDeck.current.click();
  }

  const loadFileGame = () => {
    inputFileGame.current.click();
  }

  const loadFileGameDef = () => {
    inputFileGameDef.current.click();
  }

  const loadFileCustom = () => {
    inputFileCustom.current.click();
  }

  const uploadGameAsJson = async(event) => {
    event.preventDefault();
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const gameObj = JSON.parse(event.target.result);
        if (gameObj) {
          //dispatch(setGame(gameObj));
          doActionList(["LOG", "$ALIAS_N", " uploaded a game."])
          gameBroadcast("game_action", {action: "set_game", options: {game: gameObj}})
        }
      } catch(e) {
          alert("Game must be a valid JSON file."); // error in the above string (in this case, yes)!
      }
    }
    reader.readAsText(event.target.files[0]);
    inputFileGame.current.value = "";
  }

  const uploadGameDef = async(event) => {
    event.preventDefault();
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const gameObj = JSON.parse(event.target.result);
        if (gameObj) {
          gameBroadcast("set_game_def", {game_def: gameObj}) 
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
    inputFileGameDef.current.value = "";
  }

  const uploadCustomCards = async(event) => {
    event.preventDefault();
    const reader = new FileReader();
    reader.onload = async (event) => {
      var list = JSON.parse(event.target.result);
      loadList(list);
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

  return(
    <li key={"Menu"}><div className="h-full flex items-center justify-center select-none">{siteL10n("menu")}</div>
      <ul className="second-level-menu">
        <li key={"load"}>
            {siteL10n("load")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
          <ul className="third-level-menu">
            <li key={"load_prebuilt_deck"} onClick={() => handleMenuClick({action:"spawn_deck"})}>{siteL10n("Load prebuilt deck")}</li>
            <li key={"load_url"} onClick={() => handleMenuClick({action:"load_url"})}>{siteL10n("Load via URL")}</li>
            <li key={"load_game"} onClick={() => handleMenuClick({action:"load_game"})}>
              {siteL10n("loadGameJson")}
              <input type='file' id='file' ref={inputFileGame} style={{display: 'none'}} onChange={uploadGameAsJson} accept=".json"/>
            </li>
            <li key={"load_game_def"} onClick={() => handleMenuClick({action:"load_game_def"})}>
              {siteL10n("loadGameDefinitionJson")}
              <input type='file' id='file' ref={inputFileGameDef} style={{display: 'none'}} onChange={uploadGameDef} accept=".json"/>
            </li>
            <li key={"load_custom"} onClick={() => handleMenuClick({action:"load_custom"})}>
              {siteL10n("loadCustomCardsTxt")}
              <input type='file' id='file' ref={inputFileCustom} style={{display: 'none'}} onChange={uploadCustomCards} accept=".txt"/>
            </li>
          </ul>
        </li> 
        <li key={"layout"}>
            {siteL10n("layout")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
          <ul className="third-level-menu">
            {gameDef.layoutMenu?.map((info, index) => {
              return(
                <li key={info.layoutId}>
                  <div className="absolute w-1/2">{gameL10n(info.label)}</div>
                  <div className="absolute w-1/4 left-1/2" onClick={() => handleMenuClick({action:"layout", value: info, playerI: "shared"})}>{keysDiv(siteL10n("All Players"), "w-full hover:bg-gray-400")}</div>
                  <div className="absolute w-1/4 left-3/4" onClick={() => handleMenuClick({action:"layout", value: info, playerI: playerN})}>{keysDiv(siteL10n("Just Me"), "w-full hover:bg-gray-400")}</div>
                </li>
              )
            })}
            </ul>
        </li>
        <li key={"unload"}>
            {siteL10n("unload")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
          <ul className="third-level-menu">        
            <li key={"unload_my_deck"} onClick={() => handleMenuClick({action:"unload_my_deck"})}>{siteL10n("unloadMyDeck")}</li>
            <li key={"unload_shared_cards"} onClick={() => handleMenuClick({action:"unload_shared_cards"})}>{siteL10n("unloadSharedCards")}</li>
          </ul>
        </li>
        <li key={"spawn"}>
            {siteL10n("spawnCard")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
          <ul className="third-level-menu">
            <li key={"spawn_existing"} onClick={() => handleMenuClick({action:"spawn_existing"})}>{siteL10n("fromTheCardPool")}</li>
            <li key={"spawn_custom"} onClick={() => handleMenuClick({action:"spawn_custom"})}>{siteL10n("createYourOwnCard")}</li>
          </ul>
        </li> 
        <li key={"random"}>
            {siteL10n("random")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
          <ul className="third-level-menu">
            <li key={"random_coin"} onClick={() => handleMenuClick({action:"random_coin"})}>{siteL10n("coin")}</li>
            <li key={"random_number"} onClick={() => handleMenuClick({action:"random_number"})}>{siteL10n("number")}</li>
          </ul>
        </li> 
        <li key={"options"}>
            {siteL10n("dragnOptions")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
          <ul className="third-level-menu">
            <li key={"developer_tools"} onClick={() => handleMenuClick({action:"developer_tools"})}>{siteL10n("developerTools")}</li>
          </ul>
        </li> 
        <li key={"advanced_functions"}>
            {siteL10n("pluginOptions")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
          <ul className="third-level-menu">
            {gameDef.pluginMenu?.options?.map((menuFunction, index) => {
              return(
                <li key={index} onClick={() => doActionList(menuFunction.actionList)}>{gameL10n(menuFunction.label)}</li>
              )
            })}
          </ul>
        </li> 
        <li key={"download"}>
            {siteL10n("download")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
          <ul className="third-level-menu">        
            <li key={"download"} onClick={() => handleMenuClick({action:"download"})}>{siteL10n("gameStateJson")}</li>
          </ul>
        </li>
        {isHost &&
          <li key={"reset"}>
            {siteL10n("clearTable")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
            <ul className="third-level-menu">
              {gameDef["clearTableOptions"]?.map((option, index) => {
                return(
                  <li key={index} onClick={() => handleMenuClick({action:"clear_table", actionList: option.actionList})}>{gameL10n(option.label)}</li>
                )
              })}
            </ul>
          </li> 
        }      
        {isHost &&
          <li key={"shut_down"}>
            {siteL10n("closeRoom")}
              <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
            <ul className="third-level-menu">
              {gameDef["clearTableOptions"]?.map((option, index) => {
                return(
                  <li key={index} onClick={() => handleMenuClick({action:"close_room", actionList: option.actionList})}>{gameL10n(option.label)}</li>
                )
              })}
            </ul>
          </li> 
        }
      </ul>
    </li>
  )
})