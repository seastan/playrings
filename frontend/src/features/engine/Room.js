import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import RoomProviders from "./RoomProviders";
import {useMessages, useSetMessages} from '../../contexts/MessagesContext';
import useChannel from "../../hooks/useChannel";
import { applyDelta, setGameUi } from "../store/gameUiSlice";
import useProfile from "../../hooks/useProfile";
import { resetPlayerUi } from "../store/playerUiSlice";
import { useAddMessages } from "./functions/useAddMessage";

var delayBroadcast;

export const Room = ({ slug }) => {
  const dispatch = useDispatch();
  const gameName = useSelector(state => state.gameUi.gameName);
  const setMessages = useSetMessages();
  //const addMessages = useAddMessages();
  const myUser = useProfile();
  const myUserId = myUser?.id;
  const [isClosed, setIsClosed] = useState(false);

  const onChannelMessage = useCallback((event, payload) => {
    if (!payload?.response) return;
    console.log("Got new payload: ", event, payload);
  
    if (event === "phx_reply" && payload.response.my_delta != null) {
      // Update store with my own delta
      const myDelta = payload.response.my_delta;
      console.log("my_delta", myDelta)
      console.log("inloop 0", myDelta)
      console.log("inloop 1", myDelta.latestMessages)
      dispatch(applyDelta(myDelta))
      const latestMessagesDelta = myDelta.latestMessages;
      if (latestMessagesDelta && latestMessagesDelta.length == 2 && latestMessagesDelta[1] && latestMessagesDelta[1].length > 0) {
        console.log('hi')
        setMessages(latestMessagesDelta[1])

        // console.log("inloop a")
        // for (var message of myDelta.latestMessages) {
        //   console.log("inloop b",message)
        //   //chatBroadcast("game_update", {message: message});
        // }
      }

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
      payload?.response
    ) {      
      console.log("phxmessage new", payload.response)
      const incomingMessage = payload.response.new_message;
      if (!incomingMessage) return;
      console.log("phxmessage", incomingMessage)
      setMessages([incomingMessage])
/*       if (messages === null || messages.length === 0) { 

        setMessages([incomingMessage])
      } else if (messages[messages.length - 1]?.shortcode !== incomingMessage?.shortcode) {
        setMessages([].concat(messages, incomingMessage))
      } */
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
