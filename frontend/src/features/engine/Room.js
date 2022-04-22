import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import RoomProviders from "./RoomProviders";
import {useSetMessages} from '../../contexts/MessagesContext';
import useChannel from "../../hooks/useChannel";
import { applyDelta, setGameUi } from "../store/gameUiSlice";
import useProfile from "../../hooks/useProfile";
import { resetPlayerUi } from "../store/playerUiSlice";

var delayBroadcast;

export const Room = ({ slug }) => {
  const dispatch = useDispatch();
  const gameName = useSelector(state => state.gameUi.gameName);
  const setMessages = useSetMessages();
  const myUser = useProfile();
  const myUserId = myUser?.id;
  const [isClosed, setIsClosed] = useState(false);

  const onChannelMessage = useCallback((event, payload) => {
    if (!payload?.response) return;
    console.log("Got new payload: ", event, payload);
  
    if (event === "phx_reply" && payload.response.my_delta != null) {
      // Update store with my own delta
      console.log("my_delta", payload.response.my_delta)
      dispatch(applyDelta(payload.response.my_delta))
    } else if (event === "phx_reply" && payload.response.game_ui != null) {
      // Update store with the full state received
      const { game_ui } = payload.response;
      if (gameName !== game_ui.gameName) { // Entered a new room
        // Reset player UI
        dispatch(resetPlayerUi())
      }
      // Simulate high ping/lag;
      //delayBroadcast = setTimeout(function() {
        console.log("dispatching to game", game_ui)
        dispatch(setGameUi(game_ui));
      //}, 5000);
    } else if (event === "new_delta" && payload.response.new_delta !== null) {
      // No need to apply delta for your own broadcasts, they are handled by a separate broadcast just to you (see first if statement)
      if (payload.response.user_id === myUserId) return; 
      // Simulate high ping/lag;
      //delayBroadcast = setTimeout(function() {
      dispatch(applyDelta(payload.response.new_delta))
      //}, 5000);
    } else if (event === "phx_reply" && payload.response.game_ui === null) {
      if (!isClosed) {
        setIsClosed(true);
        alert("Your room has closed or timed out. If you were in the middle of playing, it may have crashed. If so, please go to the Menu and download the game state file. Then, create a new room and upload that file to continue where you left off.")
      }
    }

  }, [gameName, myUserId]);

  const onChatMessage = useCallback((event, payload) => {
    if (
      event === "phx_reply" &&
      payload.response != null &&
      payload.response.messages != null
    ) {
      setMessages(payload.response.messages);
    }
  }, []);
  const gameBroadcast = useChannel(`room:${slug}`, onChannelMessage, myUserId);
  const chatBroadcast = useChannel(`chat:${slug}`, onChatMessage, myUserId);

  console.log('Rendering Room',myUserId);

  if (gameName !== slug) return (<div></div>);
  else {
    return (
      <RoomProviders 
        gameBroadcast={gameBroadcast} 
        chatBroadcast={chatBroadcast}/>
    );
  }
};
export default Room;
