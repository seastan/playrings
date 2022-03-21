import { createSlice } from "@reduxjs/toolkit";
import { deepUpdate, updateValues } from "./updateValues";
//const isEqual = require("react-fast-compare");

const initialState = {};

const gameUiSlice = createSlice({
  name: "gameUi",
  initialState,
  reducers: {
    setGameUi: (state, { payload }) => {
      if (!state) {
        state = payload;
      } else {
        deepUpdate(state, payload);
      }
      // Object.keys(payload).forEach((key) => {
      //   if (key !== "game") state[key] = payload[key];
      // })
    },
    setGame: (state, { payload }) => {
      if (!state.game) {
        state.game = payload;
      } else {
        deepUpdate(state.game, payload);
      }
    },
    setGroupById: (state, { payload }) => {
      state.game.groupById = payload;
    },
    setStackIds: (state, { payload }) => {
      state.game.groupById[payload.id].stackIds = payload.stackIds;
    },
    setCardIds: (state, { payload }) => {
      state.game.stackById[payload.id].cardIds = payload.cardIds;
    },
    setValues: (state, { payload }) => {
      updateValues(state, payload.updates);
    },
  },
});

export const { setGameUi, setGame, setGroupById, setStackIds, setCardIds, setValues } = gameUiSlice.actions;
export default gameUiSlice.reducer;
