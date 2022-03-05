import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  playerN: "player1",
  keypress: {
    Control: 0,
    Alt: 0,
    Tab: 0,
    Space: 0,
    w: null,
  },
  showHotkeys: false,
  touchMode: false,
  typing: false,
  cardSize: null,
  cardSizeFactor: 1.0,
  activeCardObj: null,
  observingPlayerN: "player1",
  dropdownMenuObj: null,
  showModal: null,
  loaded: null,
  showPlayersInRoom: false,
  sittingPlayerN: null,
  browseGroup: {
    id: null,
    topN: 0
  },
  tooltipIds: [],
  mousePosition: null,
  touchAction: null,
  sideGroupId: "sharedSetAside",
};

const roomUiSlice = createSlice({
  name: "roomUi",
  initialState,
  reducers: {
    setPlayerN: (state, { payload }) => {
      state.playerN = payload;
    },
    setKeypress: (state, { payload }) => {
      state.keypress = payload;
    },
    setKeypressControl: (state, { payload }) => {
      state.keypress.Control = payload;
    },
    setKeypressAlt: (state, { payload }) => {
      state.keypress.Control = payload;
    },
    setKeypressTab: (state, { payload }) => {
      state.keypress.Control = payload;
    },
    setKeypressSpace: (state, { payload }) => {
      state.keypress.Control = payload;
    },
    setKeypressW: (state, { payload }) => {
      state.keypress.w = payload;
    },
    setShowHotkeys: (state, { payload }) => {
      state.showHotkeys = payload;
    },
    setTouchMode: (state, { payload }) => {
      state.touchMode = payload;
    },
    setTyping: (state, { payload }) => {
      state.typing = payload;
    },
    setCardSize: (state, { payload }) => {
      state.cardSize = payload;
    },
    setCardSizeFactor: (state, { payload }) => {
      state.cardSizeFactor = payload;
    },
    setActiveCardObj: (state, { payload }) => {
      state.activeCardObj = payload;
    },
    setObservingPlayerN: (state, { payload }) => {
      state.observingPlayerN = payload;
    },
    setDropdownMenuObj: (state, { payload }) => {      
      console.log("setting setDropdownMenuObj", payload)
      state.dropdownMenuObj = payload;
    },
    setShowModal: (state, { payload }) => {
      state.showModal = payload;
    },
    setLoaded: (state, { payload }) => {
      state.loaded = payload;
    },
    setShowPlayersInRoom: (state, { payload }) => {
      state.showPlayersInRoom = payload;
    },
    setSittingPlayerN: (state, { payload }) => {
      state.sittingPlayerN = payload;
    },
    setBrowseGroupId: (state, { payload }) => {
      state.browseGroup.id = payload;
    },
    setBrowseGroupTopN: (state, { payload }) => {
      state.browseGroup.topN = payload;
    },
    setTooltipIds: (state, { payload }) => {
      state.tooltipIds = payload;
    },
    setMousePosition: (state, { payload }) => {
      state.mousePosition = payload;
    },
    setTouchAction: (state, { payload }) => {
      state.touchAction = payload;
    },
    setSideGroupId: (state, { payload }) => {
      state.sideGroupId = payload;
    },
  }
});

export const { 
  setPlayerN, 
  setKeypress, 
  setKeypressControl,
  setKeypressAlt,
  setKeypressTab,
  setKeypressSpace,
  setKeypressW, 
  setShowHotkeys, 
  setTouchMode, 
  setTyping, 
  setCardSize,
  setCardSizeFactor,
  setActiveCardObj,
  setObservingPlayerN,
  setDropdownMenuObj,
  setShowModal,
  setLoaded,
  setShowPlayersInRoom,
  setSittingPlayerN,
  setBrowseGroupId,
  setBrowseGroupTopN,
  setTooltipIds,
  setMousePosition,
  setTouchAction,
  setSideGroupId,
 } = roomUiSlice.actions;
export default roomUiSlice.reducer;
