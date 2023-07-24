import React, { useContext, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from "react-router-dom";
import useProfile from "../../hooks/useProfile";
import store from "../../store";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setZoomFactor, setLoaded, setRandomNumBetween, setShowModal, setTouchAction, setTouchMode, setShowDeveloper } from "../store/playerUiSlice";
import { useGameL10n } from "./hooks/useGameL10n";
import BroadcastContext from "../../contexts/BroadcastContext";
import { useGameDefinition } from "./hooks/useGameDefinition";
import { useDoActionList } from "./hooks/useDoActionList";
import { useSiteL10n } from "../../hooks/useSiteL10n";
import { getRandomIntInclusive } from "./functions/common";
import { useImportLoadList } from "./hooks/useImportLoadList";
import { useImportViaUrl } from "./hooks/useImportViaUrl";


export const TopBarMenu = React.memo(({}) => {
  const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
  const myUser = useProfile();
  const myUserID = myUser?.id;
  const history = useHistory();
  const gameL10n = useGameL10n();
  const siteL10n = useSiteL10n();
  const gameDef = useGameDefinition();
  const doActionList = useDoActionList();
  const loadList = useImportLoadList();
  const importViaUrl = useImportViaUrl();

  const createdBy = useSelector(state => state.gameUi?.createdBy);
  const options = useSelector(state => state.gameUi?.game?.options);
  const isHost = myUserID === createdBy;  
  const playerN = useSelector(state => state?.playerUi?.playerN);
  const zoomFactor = useSelector(state => state?.playerUi?.zoomFactor);
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
      doActionList(data.actionList);
      // Save replay
      gameBroadcast("game_action", {action: "save_replay", options: {}});
      // Reset game
      gameBroadcast("game_action", {action: "reset_game", options: {}});
      doActionList(["LOG", "$PLAYER_N", " reset the game."]);
    } else if (data.action === "close_room") {
      // Mark status
      doActionList(data.actionList);
      // Save replay
      gameBroadcast("game_action", {action: "save_replay", options: {}});
      // Close room
      history.push("/profile");
      doActionList(["LOG", "$PLAYER_N", " closed the room."]);
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
        ["LOG", "$PLAYER_N", " deleted all their cards."]
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
        ["LOG", "$PLAYER_N", " deleted all shared cards."]
      ]
      doActionList(actionList);
    } else if (data.action === "random_coin") {
      const result = getRandomIntInclusive(0,1);
      if (result) doActionList(["LOG", "$PLAYER_N", " flipped heads."]);
      else doActionList(["LOG", "$PLAYER_N", " flipped tails."]);
    } else if (data.action === "random_number") {
      const max = parseInt(prompt("Random number between 1 and...",randomNumBetween));
      if (max>=1) {
        dispatch(setRandomNumBetween(max))
        const result = getRandomIntInclusive(1,max);
        doActionList(["LOG", "$PLAYER_N", " chose a random number (1-"+max+"): "+result]);
      }
    } else if (data.action === "adjust_card_size") {
      const num = parseInt(prompt("Adjust the apparent card size for yourself only (10-1000):",Math.round(zoomFactor*100)));
      if (num>=10 && num<=1000) {
        dispatch(setZoomFactor(num/100));
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
      doActionList([
        ["SET", "/layoutId", data.value.layoutId],
        ["SET", "/numPlayers", data.value.numPlayers]
      ]);
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
          doActionList(["LOG", "$PLAYER_N", " uploaded a game."])
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
                <li key={info.layoutId} onClick={() => handleMenuClick({action:"layout", value: info})}>{gameL10n(info.label)}</li>
              )
            })}
            </ul>
        </li>
        <li key={"touch_mode"}>
            {siteL10n("touchMode")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
          <ul className="third-level-menu">
              <li key={"touch_enabled"} onClick={() => dispatch(setTouchMode(true))}>{siteL10n("enable")}</li>
              <li key={"touch_disabled"} onClick={() => {dispatch(setTouchMode(false)) && dispatch(setTouchAction(null))}}>{siteL10n("Disable")}</li>
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
            <li key={"adjust_card_size"} onClick={() => handleMenuClick({action:"adjust_card_size"})}>{siteL10n("adjustCardSize")}</li>
            <li key={"developer_tools"} onClick={() => handleMenuClick({action:"developer_tools"})}>{siteL10n("developerTools")}</li>

          </ul>
        </li> 
        <li key={"advanced_functions"}>
            {siteL10n("pluginOptions")}
            <span className="float-right mr-1"><FontAwesomeIcon icon={faChevronRight}/></span>
          <ul className="third-level-menu">
            {gameDef.pluginMenu?.options?.map((menuFunction, _index) => {
              return(
                <li key={menuFunction.id} onClick={() => doActionList(menuFunction.actionList)}>{gameL10n(menuFunction.label)}</li>
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