import { createSlice } from "@reduxjs/toolkit";
//const isEqual = require("react-fast-compare");

const isObject = (item) => {
  return (typeof item === "object" && !Array.isArray(item) && item !== null);
}

const arraysEqual = (a, b) => {
  /* WARNING: only works for arrays of primitives */
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const deepUpdate = (obj1, obj2) => {
  // If they are already equal, we are done
  if (obj1 === obj2) return;
  // If obj1 does not exist, set it to obj2
  if (!obj1) {
    obj1 = obj2;
    return;
  }
  // If obj2 does not exist, update obj1
  if (!obj2) {
    obj1 = obj2;
    return;
  }
  // First we delete properties from obj1 that no longer exist
  for (var p in obj1) {
    //// Ignore prototypes
    //if (!obj1.hasOwnProperty(p)) continue;
    // If property no longer exists in obj2, delete it from obj1
    if (!obj2.hasOwnProperty(p)) {
      delete obj1[p]
      continue;
    }
  }
  // The we loop through obj2 properties and update obj1
  for (var p in obj2) {
    // Ignore prototypes
    //if (!obj2.hasOwnProperty(p)) continue;
    // If property does not exists in obj1, add it to obj1
    if (!obj1.hasOwnProperty(p)) {
      obj1[p] = obj2[p];
      continue;
    }
    // Both objects have the property
    // If they have the same strict value or identity then no need to update
    if (obj1[p] === obj2[p]) continue;
    // Objects are not equal. We need to examine their data type to decide what to do
    if (Array.isArray(obj1[p]) && Array.isArray(obj2[p])) {
      // Both values are arrays
      if (!arraysEqual(obj1[p],obj2[p])) {
        // Arrays are not equal, so update
        obj1[p] = obj2[p];
      }
    } else if (isObject(obj1[p]) && isObject(obj2[p])) {
      // Both values are objects
      deepUpdate(obj1[p], obj2[p]);
    } else {
      // One of the values is not an object/array, so it's a basic type and should be updated
      obj1[p] = obj2[p];
    }
  }
} 

const updateValue = (obj, update) => {
  const updateLength = update.length;
  if (updateLength === 2) {
    obj[update[0]] = update[1];
  } else if (updateLength > 2) {
    updateValue(obj[update[0]], update.slice(1));
  }
}

const updateValues = (obj, updates) => {
  for (var update of updates) updateValue(obj, update);
}

const initialState = {"count": 1};

const gameUiSlice = createSlice({
  name: "gameUi",
  initialState,
  reducers: {
    setGameUi: (state, { payload }) => {
      Object.keys(payload).forEach((key) => {
        if (key !== "game") state[key] = payload[key];
      })
    },
    setGame: (state, { payload }) => {
      if (!state.game) {
        state.game = payload;
      } else {
        deepUpdate(state.game, payload);
      }
    },
    setGameName: (state, { payload }) => {
      state.gameName = payload;
    },
    setNumPlayers: (state, { payload }) => {
      state.numPlayers = payload;
    },
    setLayout: (state, { payload }) => {
      state.layout = payload;
    },
    setGroupById: (state, { payload }) => {
      state.game.groupById = payload;
    },
    setGroup: (state, { payload }) => {
      state.game.groupById[payload.id] = payload;
    },
    setStackIds: (state, { payload }) => {
      state.game.groupById[payload.id].stackIds = payload.stackIds;
    },
    setStack: (state, { payload }) => {
      state.game.stackById[payload.id] = payload;
    },
    setCardIds: (state, { payload }) => {
      state.game.stackById[payload.id].cardIds = payload.cardIds;
    },
    setPlayerIds: (state, { payload }) => {
      if (!state.playerIds) {
        state.playerIds = payload;
      } else {
        deepUpdate(state.playerIds, payload);
      }
    },
    setValues: (state, { payload }) => {
      console.log(payload)
      updateValues(state, payload.updates);
    },
    incrementRound: (state, { payload }) => {
      state.game.roundNumber = state.game.roundNumber+1;
    },
  },
});

export const { setGameUi, setGame, setGroupById, setGroup, setStackIds, setStack, setCardIds, setPlayerIds, setValues, incrementRound } = gameUiSlice.actions;
export default gameUiSlice.reducer;
