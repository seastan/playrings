import { combineReducers } from "@reduxjs/toolkit";
import users from "./features/user/usersSlice";
import gameUi from "./features/room/gameUiSlice";
import roomUi from "./features/room/roomUiSlice"

const rootReducer = combineReducers({
  users, gameUi, roomUi
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
