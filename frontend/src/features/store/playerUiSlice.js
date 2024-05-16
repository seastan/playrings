import { createSlice } from "@reduxjs/toolkit";
import { updateValues } from "./updateValues";
import { uiSettings } from "../engine/SettingsModal";

const draggingDefault = {
  stackId: null,
  end: null,
  endDelay: null,
  transform: null,
  fromGroupId: null,
  toGroupId: null,
  toRegionType: null,
  mouseCurrentX: null,
  mouseCurrentY: null,
  mouseDownX: null,
  mouseDownY: null,
  stackRectangles: [],
  groupRectangle: null,
};

const initialState = {
  alertMessage: null,
  playerN: "player1",
  keypress: {
    Control: 0,
    Alt: 0,
    Tab: 0,
    Space: 0,
  },
  replayStep: 0,
  showHotkeys: false,
  touchMode: false,
  typing: false,
  activeCardId: null,
  preHotkeyActiveCardGroupId: null,
  observingPlayerN: "player1",
  dropdownMenu: null,
  showModal: null,
  showDeveloper: null,
  showPlayersInRoom: false,
  tooltipIds: [],
  mouseXY: null,
  cardClicked: false,
  randomNumBetween: "3",
  autoLoadedDecks: false,
  droppableRefs: {},
  dragging: draggingDefault,
  tempDragStack: {
    stackId: null,
    toGroupId: null,
    left: null,
    top: null,
  },
  userSettings: Object.keys(uiSettings).reduce((acc, settingId) => {
    acc[settingId] = uiSettings[settingId].default;
    return acc;
  },{})
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
    setAlertMessage: (state, { payload }) => {
      state.alertMessage = payload;
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
    setRandomNumBetween: (state, { payload }) => {
      state.randomNumBetween = payload;
    },
    setDraggingDefault: (state) => {
      state.dragging = draggingDefault;
    },
    setDraggingFromGroupId: (state, { payload }) => {
      state.dragging.fromGroupId = payload;
    },
    setDraggingToGroupId: (state, { payload }) => {
      state.dragging.toGroupId = payload;
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
    setDraggingPrevStyle: (state, { payload }) => {
      state.dragging.prevStyle = payload;
    },
    setDraggingMouseCurrentX: (state, { payload }) => {
      state.dragging.mouseCurrentX = payload;
    },
    setDraggingMouseCurrentY: (state, { payload }) => {
      state.dragging.mouseCurrentY = payload;
    },
    setDraggingMouseDownX: (state, { payload }) => {
      state.dragging.mouseDownX = payload;
    },
    setDraggingMouseDownY: (state, { payload }) => {
      state.dragging.mouseDownY = payload;
    },
    setDraggingStackRectangles: (state, { payload }) => {
      state.dragging.stackRectangles = payload;
    },
    setDraggingGroupRectangle: (state, { payload }) => {
      state.dragging.groupRectangle = payload;
    },
    setUserSettings: (state, { payload }) => {
      state.userSettings = payload; 
    },
    setAutoLoadedDecks: (state, { payload }) => {
      state.autoLoadedDecks = payload;
    },
    setDroppableRefs: (state, { payload }) => {
      state.droppableRefs[payload.id] = payload.ref;
    },
    setTempDragStack: (state, { payload }) => {
      state.tempDragStack = payload;
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
  setActiveCardId,
  setPreHotkeyActiveCardGroupId,
  setScreenLeftRight,
  setObservingPlayerN,
  setDropdownMenu,
  setShowModal,
  setShowDeveloper,
  setLoaded,
  setShowPlayersInRoom,
  setTooltipIds,
  setMouseXY,
  setMouseTopBottom,
  setCardClicked,
  setRandomNumBetween,
  setDraggingDefault,
  setDraggingFromGroupId,
  setDraggingStackId,
  setDraggingEnd,
  setDraggingEndDelay,
  setDraggingTransform,
  setDraggingPrevStyle,
  setDraggingToGroupId,
  setDraggingToRegionType,
  setDraggingMouseCurrentX,
  setDraggingMouseCurrentY,
  setDraggingMouseDownX,
  setDraggingMouseDownY,
  setDraggingStackRectangles,
  setDraggingGroupRectangle,
  setUserSettings,
  setAlertMessage,
  setAutoLoadedDecks,
  setDroppableRefs,
  setTempDragStack
 } = playerUiSlice.actions;
export default playerUiSlice.reducer;
