import { useContext } from "react";
import BroadcastContext from "../../../contexts/BroadcastContext";
import store from "../../../store";
import { useDoActionList } from "./useDoActionList";
import { dragnActionLists } from "../functions/dragnActionLists";

export const dragnHotkeys = [
    {"key": "T", "actionList": "targetCard", "label": "targetCard"},
    {"key": "Shift+W", "actionList": "drawArrow", "label": "startStopDrawingArrow"},
    {"key": "Escape", "actionList": "clearTargets", "label": "clearTargetsArrows"},
    {"key": "Ctrl+S", "actionList": "saveGame", "label": "saveGame"},
    {"key": "Ctrl+Z", "actionList": "undo", "label": "undoOneAction"},
    {"key": "Ctrl+Y", "actionList": "redo", "label": "redoOneAction"},
    {"key": "ArrowLeft", "actionList": "undo", "label": "undoOneAction"},
    {"key": "ArrowRight", "actionList": "redo", "label": "redoOneAction"},
    {"key": "Shift+ArrowLeft", "actionList": "undoMany", "label": "undoManyActions"},
    {"key": "Shift+ArrowRight", "actionList": "redoMany", "label": "redoManyActions"},
    {"key": "ArrowUp", "actionList": "prevStep", "label": "moveToPreviousGameStep"},
    {"key": "ArrowDown", "actionList": "nextStep", "label": "moveToNextGameStep"}
  ]
  
  export const useDoDragnHotkey = () => {
    const doActionList = useDoActionList();
    const {gameBroadcast} = useContext(BroadcastContext);
    return (actionList) => {
      switch (actionList) {
        case "targetCard":
          return doActionList(dragnActionLists.targetCard());
        case "saveGame":
          return gameBroadcast("game_action", {action: "save_replay", options: {player_ui: store.getState().playerUi}});
        case "clearTargets":
            return doActionList(dragnActionLists.clearTargets());
        case "undo":
            return gameBroadcast("step_through", {options: {size: "single", direction: "undo"}});
        case "redo":
            return gameBroadcast("step_through", {options: {size: "single", direction: "redo"}});
        case "undoMany":
            return gameBroadcast("step_through", {options: {size: "round", direction: "undo"}});
        case "redoMany":
            return gameBroadcast("step_through", {options: {size: "round", direction: "redo"}});
        case "prevStep": 
            return doActionList([
                ["LOG", "$ALIAS_N", " set the round step to ", "$GAME.steps.$STEP_ID.label", "."],
                ["DEFINE", "$OLD_STEP_INDEX", ["GET_INDEX", "$GAME.stepOrder", "$GAME.stepId"]],
                ["COND",
                  ["EQUAL", "$OLD_STEP_INDEX", 0],
                  ["DEFINE", "$NEW_STEP_INDEX", ["SUBTRACT", ["LENGTH", "$GAME.stepOrder"], 1]],
                  true,
                  ["DEFINE", "$NEW_STEP_INDEX", ["SUBTRACT", "$OLD_STEP_INDEX", 1]]
                ],
                ["DEFINE", "$STEP_ID", "$GAME.stepOrder.[$NEW_STEP_INDEX]"],
                ["SET", "/stepId", "$STEP_ID"]
            ])
        case "nextStep":
          return doActionList([
              ["LOG", "$ALIAS_N", " set the round step to ", "$GAME.steps.$STEP_ID.label", "."],
              ["DEFINE", "$OLD_STEP_INDEX", ["GET_INDEX", "$GAME.stepOrder", "$GAME.stepId"]],
              ["COND",
                ["EQUAL", "$OLD_STEP_INDEX", ["SUBTRACT", ["LENGTH", "$GAME.stepOrder"], 1]],
                ["DEFINE", "$NEW_STEP_INDEX", 0],
                true,
                ["DEFINE", "$NEW_STEP_INDEX", ["ADD", "$OLD_STEP_INDEX", 1]]
              ],
              ["DEFINE", "$STEP_ID", "$GAME.stepOrder.[$NEW_STEP_INDEX]"],
              ["SET", "/stepId", "$STEP_ID"]
          ])
        case "drawArrow":
            return doActionList([
                ["DEFINE", "$FROM_CARD_ID", "$GAME.playerData.$PLAYER_N.drawingArrowFrom"],
                ["COND",
                  ["EQUAL", "$FROM_CARD_ID", null],
                  [
                    ["LOG", "$ALIAS_N", " is drawing an arrow from ", "$ACTIVE_CARD.currentFace.name", "."],
                    ["SET", "/playerData/$PLAYER_N/drawingArrowFrom", "$ACTIVE_CARD_ID"]
                  ],
                  ["IN_LIST", "$GAME.cardById.$FROM_CARD_ID.arrows.$PLAYER_N", "$ACTIVE_CARD_ID"],
                  [
                    ["LOG", "$ALIAS_N", " removed an arrow to ", "$ACTIVE_CARD.currentFace.name", "."],
                    ["SET", "/cardById/$FROM_CARD_ID/arrows/$PLAYER_N", 
                      ["REMOVE_FROM_LIST_BY_VALUE", "$GAME.cardById.$FROM_CARD_ID.arrows.$PLAYER_N", "$ACTIVE_CARD_ID"]
                    ],
                    ["SET", "/playerData/$PLAYER_N/drawingArrowFrom", null]
                  ],
                  true,
                  [
                    ["LOG", "$ALIAS_N", " drew an arrow to ", "$ACTIVE_CARD.currentFace.name", "."],
                    ["SET", "/cardById/$FROM_CARD_ID/arrows/$PLAYER_N", ["APPEND", "$GAME.cardById.$FROM_CARD_ID.arrows.$PLAYER_N", "$ACTIVE_CARD_ID"]],
                    ["SET", "/playerData/$PLAYER_N/drawingArrowFrom", null]
                  ]
                ]
            ])
        }
    }
  }