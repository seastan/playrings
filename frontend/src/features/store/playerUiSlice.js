import { createSlice } from "@reduxjs/toolkit";
import { updateValues } from "./updateValues";


const initialState = {
  playerN: "player1",
  keypress: {
    Control: 0,
    Alt: 0,
    Tab: 0,
    Space: 0,
    w: null,
  },
  replayStep: 0,
  showHotkeys: false,
  touchMode: false,
  typing: false,
  zoomFactor: 1.0,
  activeCardId: null,
  preHotkeyActiveCardGroupId: null,
  observingPlayerN: "player1",
  dropdownMenu: null,
  showModal: null,
  showDeveloper: null,
  loaded: null,
  showPlayersInRoom: false,
  browseGroup: {
    id: null,
    topN: 0
  },
  tooltipIds: [],
  mouseXY: null,
  cardClicked: false,
  touchAction: null,
  sideGroupId: "sharedSetAside",
  favoriteGroupId: null,
  randomNumBetween: "3",
  dragging: {
    stackId: null,
    end: null,
    endDelay: null,
    transform: null,
    fromGroupId: null,
    toRegionType: null,
  },
  prompts: []
};

const playerUiSlice = createSlice({
  name: "playerUi",
  initialState,
  reducers: {
    resetPlayerUi: () => initialState,
    setPlayerUiValues: (state, { payload }) => {
      updateValues(state, payload.updates);
    },
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
      state.keypress.Alt = payload;
    },
    setKeypressShift: (state, { payload }) => {
      state.keypress.Shift = payload;
    },
    setKeypressTab: (state, { payload }) => {
      state.keypress.Tab = payload;
    },
    setKeypressSpace: (state, { payload }) => {
      state.keypress.Space = payload;
    },
    setKeypressW: (state, { payload }) => {
      state.keypress.w = payload;
    },
    setReplayStep: (state, { payload }) => {
      state.replayStep = payload;
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
    setZoomFactor: (state, { payload }) => {
      state.zoomFactor = payload;
    },
    setActiveCardId: (state, { payload }) => {
      state.activeCardId = payload;
    },
    setPreHotkeyActiveCardGroupId: (state, { payload }) => {
      state.preHotkeyActiveCardGroupId = payload;
    },
    setScreenLeftRight: (state, { payload }) => {
      state.screenLeftRight = payload;
    },
    setObservingPlayerN: (state, { payload }) => {
      state.observingPlayerN = payload;
    },
    setDropdownMenu: (state, { payload }) => {
      state.dropdownMenu = payload;
    },
    setShowModal: (state, { payload }) => {
      state.showModal = payload;
    },
    setShowDeveloper: (state, { payload }) => {
      state.showDeveloper = payload;
    },
    setLoaded: (state, { payload }) => {
      state.loaded = payload;
    },
    setShowPlayersInRoom: (state, { payload }) => {
      state.showPlayersInRoom = payload;
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
    setMouseXY: (state, { payload }) => {
      state.mouseXY = payload;
    },
    setMouseTopBottom: (state, { payload }) => {
      state.mouseTopBottom = payload;
    },
    setCardClicked: (state, { payload }) => {
      state.cardClicked = payload;
    },
    setTouchAction: (state, { payload }) => {
      state.touchAction = payload;
    },
    setSideGroupId: (state, { payload }) => {
      state.sideGroupId = payload;
    },
    setFavoriteGroupId: (state, { payload }) => {
      state.favoriteGroupId = payload;
    },
    setRandomNumBetween: (state, { payload }) => {
      state.randomNumBetween = payload;
    },
    setDraggingFromGroupId: (state, { payload }) => {
      state.dragging.fromGroupId = payload;
    },
    setDraggingToRegionType: (state, { payload }) => {
      state.dragging.toRegionType = payload;
    },
    setDraggingStackId: (state, { payload }) => {
      state.dragging.stackId = payload;
    },
    setDraggingEnd: (state, { payload }) => {
      state.dragging.end = payload;
    },
    setDraggingEndDelay: (state, { payload }) => {
      state.dragging.endDelay = payload;
    },
    setDraggingTransform: (state, { payload }) => {
      state.dragging.transform = payload;
    },
    setPrompts: (state, { payload }) => {
      state.prompts = payload;
    },
    addPrompt: (state, { payload }) => {
      state.prompts.push(payload);
    },
    popPrompt: (state) => {
      state.prompts.shift();
    }
  }
});

export const { 
  resetPlayerUi,
  setPlayerUiValues,
  setPlayerN, 
  setKeypress, 
  setKeypressControl,
  setKeypressShift,
  setKeypressAlt,
  setKeypressTab,
  setKeypressSpace,
  setKeypressW, 
  setReplayStep,
  setShowHotkeys, 
  setTouchMode, 
  setTyping,
  setZoomFactor,
  setActiveCardId,
  setPreHotkeyActiveCardGroupId,
  setScreenLeftRight,
  setObservingPlayerN,
  setDropdownMenu,
  setShowModal,
  setShowDeveloper,
  setLoaded,
  setShowPlayersInRoom,
  setBrowseGroupId,
  setBrowseGroupTopN,
  setTooltipIds,
  setMouseXY,
  setMouseTopBottom,
  setCardClicked,
  setTouchAction,
  setSideGroupId,
  setFavoriteGroupId,
  setRandomNumBetween,
  setDraggingFromGroupId,
  setDraggingStackId,
  setDraggingEnd,
  setDraggingEndDelay,
  setDraggingTransform,
  setDraggingToRegionType
 } = playerUiSlice.actions;
export default playerUiSlice.reducer;
