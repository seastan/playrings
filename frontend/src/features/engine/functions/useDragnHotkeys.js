import { useContext } from "react";
import BroadcastContext from "../../../contexts/BroadcastContext";
import store from "../../../store";
import { useDoActionList } from "./useDoActionList";

export const dragnHotkeys = [
    {"key": "Shift+P", "actionListId": "saveGame", "labelId": "saveGame"},
    {"key": "Escape", "actionListId": "clearTargets", "labelId": "clearTargetsArrows"},
    {"key": "Ctrl+Z", "actionListId": "undo", "labelId": "undoOneAction"},
    {"key": "Ctrl+Y", "actionListId": "redo", "labelId": "redoOneAction"},
    {"key": "ArrowLeft", "actionListId": "undo", "labelId": "undoOneAction"},
    {"key": "ArrowRight", "actionListId": "redo", "labelId": "redoOneAction"},
    {"key": "Shift+ArrowLeft", "actionListId": "undoMany", "labelId": "undoManyActions"},
    {"key": "Shift+ArrowRight", "actionListId": "redoMany", "labelId": "redoManyActions"},
    {"key": "ArrowUp", "actionListId": "prevStep", "labelId": "moveToPreviousGameStep"},
    {"key": "ArrowDown", "actionListId": "nextStep", "labelId": "moveToNextGameStep"},
    {"key": "Shift+ArrowUp", "actionListId": "prevPhase", "labelId": "moveToPreviousPhase"},
    {"key": "Shift+ArrowDown", "actionListId": "nextPhase", "labelId": "moveToNextPhase"}
  ]
  
  export const useDoDragnHotkey = () => {
    const doActionList = useDoActionList();
    const {gameBroadcast} = useContext(BroadcastContext);
    return (actionListId) => {
      switch (actionListId) {
        case "saveGame":
          return gameBroadcast("game_action", {action: "save_replay", options: {player_ui: store.getState().playerUi}});
        case "clearTargets":
            return doActionList([
            ["FOR_EACH_KEY_VAL", "$CARD_ID", "$CARD", "$CARD_BY_ID",
              ["GAME_SET_VAL", "/cardById/$CARD_ID/targeting/$PLAYER_N", false]
            ],
            ["GAME_ADD_MESSAGE", "$PLAYER_N", " cleared their targets."]
          ])
        case "undo":
            return gameBroadcast("game_action", {action: "step_through", options: {"size": 1, "direction": "undo", player_ui: store.getState().playerUi}});
        case "redo":
            return gameBroadcast("game_action", {action: "step_through", options: {"size": 1, "direction": "undo", player_ui: store.getState().playerUi}});
        case "undoMany":
            return gameBroadcast("game_action", {action: "step_through", options: {"size": 20, "direction": "undo", player_ui: store.getState().playerUi}});
        case "redoMany":
            return gameBroadcast("game_action", {action: "step_through", options: {"size": 20, "direction": "undo", player_ui: store.getState().playerUi}});
        case "prevStep": 
            return doActionList([
                ["GAME_DECREASE_VAL", "/stepIndex", 1],
                ["COND",
                ["LESS_THAN", "$GAME.stepIndex", 0],
                ["GAME_SET_VAL", "/stepIndex", ["MINUS", ["LENGTH", "$GAME.gameDef.steps"], 1]]
                ],
                ["DEFINE", "$STEP_INDEX", "$GAME.stepIndex"],
                ["DEFINE", "$STEP", "$GAME.gameDef.steps.[$STEP_INDEX]"],
                ["GAME_ADD_MESSAGE", "$PLAYER_N", " set the round step to ", "$STEP.text", "."]
            ])
        case "nextStep":
            return doActionList([
                ["GAME_INCREASE_VAL", "/stepIndex", 1],
                    ["COND",
                    ["EQUAL", "$GAME.stepIndex", ["LENGTH", "$GAME.gameDef.steps"],
                    ["GAME_SET_VAL", "/stepIndex", 0]
                    ]
                ],
                ["DEFINE", "$STEP_INDEX", "$GAME.stepIndex"],
                ["DEFINE", "$STEP", "$GAME.gameDef.steps.[$STEP_INDEX]"],
                ["GAME_ADD_MESSAGE", "$PLAYER_N", " set the round step to ", "$STEP.text", "."]
          ])
        }
    }
  }