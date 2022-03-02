import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  playerN: "player1",
  keypress: {}
};

const roomUiSlice = createSlice({
  name: "roomUi",
  initialState,
  reducers: {
    setPlayerN: (state, { payload }) => {
      state.playerN = payload;
    },
  }
});

export const { setPlayerN } = roomUiSlice.actions;
export default roomUiSlice.reducer;
