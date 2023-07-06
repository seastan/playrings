import { useContext } from "react";
import BroadcastContext from "../../../contexts/BroadcastContext";
import store from "../../../store";
import { useDoActionList } from "./useDoActionList";

export const dragnHotkeys = [
    {"key": "Shift+P", "actionList": "saveGame", "label": "saveGame"},
    {"key": "Shift+W", "actionList": "drawArrow", "label": "startStopDrawingArrow"},
    {"key": "Escape", "actionList": "clearTargets", "label": "clearTargetsArrows"},
    {"key": "Ctrl+Z", "actionList": "undo", "label": "undoOneAction"},
    {"key": "Ctrl+Y", "actionList": "redo", "label": "redoOneAction"},
    {"key": "ArrowLeft", "actionList": "undo", "label": "undoOneAction"},
    {"key": "ArrowRight", "actionList": "redo", "label": "redoOneAction"},
    {"key": "Shift+ArrowLeft", "actionList": "undoMany", "label": "undoManyActions"},
    {"key": "Shift+ArrowRight", "actionList": "redoMany", "label": "redoManyActions"},
    {"key": "ArrowUp", "actionList": "prevStep", "label": "moveToPreviousGameStep"},
    {"key": "ArrowDown", "actionList": "nextStep", "label": "moveToNextGameStep"},
    {"key": "Shift+ArrowUp", "actionList": "prevPhase", "label": "moveToPreviousPhase"},
    {"key": "Shift+ArrowDown", "actionList": "nextPhase", "label": "moveToNextPhase"}
  ]
  
  export const useDoDragnHotkey = () => {
    const doActionList = useDoActionList();
    const {gameBroadcast} = useContext(BroadcastContext);
    return (actionList) => {
      switch (actionList) {
        case "saveGame":
          return gameBroadcast("game_action", {action: "save_replay", options: {player_ui: store.getState().playerUi}});
        case "clearTargets":
            return doActionList([
            ["FOR_EACH_KEY_VAL", "$CARD_ID", "$CARD", "$CARD_BY_ID",
              [
                ["SET", "/cardById/$CARD_ID/targeting/$PLAYER_N", false],
                ["SET", "/cardById/$CARD_ID/arrows/$PLAYER_N", null]
              ]
            ],
            ["LOG", "$PLAYER_N", " cleared their targets and arrows."]
          ])
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
                ["DECREASE_VAL", "/stepIndex", 1],
                ["COND",
                ["LESS_THAN", "$GAME.stepIndex", 0],
                ["SET", "/stepIndex", ["MINUS", ["LENGTH", "$GAME.gameDef.steps"], 1]]
                ],
                ["DEFINE", "$STEP_INDEX", "$GAME.stepIndex"],
                ["DEFINE", "$STEP", "$GAME.gameDef.steps.[$STEP_INDEX]"],
                ["LOG", "$PLAYER_N", " set the round step to ", "$STEP.text", "."]
            ])
        case "nextStep":
            return doActionList([
                ["INCREASE_VAL", "/stepIndex", 1],
                    ["COND",
                    ["EQUAL", "$GAME.stepIndex", ["LENGTH", "$GAME.gameDef.steps"],
                    ["SET", "/stepIndex", 0]
                    ]
                ],
                ["DEFINE", "$STEP_INDEX", "$GAME.stepIndex"],
                ["DEFINE", "$STEP", "$GAME.gameDef.steps.[$STEP_INDEX]"],
                ["LOG", "$PLAYER_N", " set the round step to ", "$STEP.text", "."]
          ])
        case "drawArrow":
            return doActionList([
                ["DEFINE", "$FROM_CARD_ID", "$GAME.playerData.$PLAYER_N.drawingArrowFrom"],
                ["COND",
                  ["EQUAL", "$FROM_CARD_ID", null],
                  [
                    ["SET", "/playerData/$PLAYER_N/drawingArrowFrom", "$ACTIVE_CARD_ID"],
                    ["LOG", "$PLAYER_N", " is drawing an arrow from ", "$ACTIVE_CARD.currentFace.name", "."]
                  ],
                  ["IN_LIST", "$GAME.cardById.$FROM_CARD_ID.arrows.$PLAYER_N", "$ACTIVE_CARD_ID"],
                  [
                    ["SET", "/cardById/$FROM_CARD_ID/arrows/$PLAYER_N", 
                      ["REMOVE_FROM_LIST_BY_VALUE", "$GAME.cardById.$FROM_CARD_ID.arrows.$PLAYER_N", "$ACTIVE_CARD_ID"]
                    ],
                    ["SET", "/playerData/$PLAYER_N/drawingArrowFrom", null],
                    ["LOG", "$PLAYER_N", " removed an arrow to ", "$ACTIVE_CARD.currentFace.name", "."]
                  ],
                  true,
                  [
                    ["LOG", "$PLAYER_N", " drew an arrow to ", "$ACTIVE_CARD.currentFace.name", "."],
                    ["SET", "/cardById/$FROM_CARD_ID/arrows/$PLAYER_N", ["APPEND", "$GAME.cardById.$FROM_CARD_ID.arrows.$PLAYER_N", "$ACTIVE_CARD_ID"]],
                    ["SET", "/playerData/$PLAYER_N/drawingArrowFrom", null]
                  ]
                ]
            ])
        }
    }
  }