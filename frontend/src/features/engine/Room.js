import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import RoomProviders from "./RoomProviders";
import {useSetMessages} from '../../contexts/MessagesContext';
import useChannel from "../../hooks/useChannel";
import { applyDeltaRedo, setGameUi, setPlayerInfo, setSockets } from "../store/gameUiSlice";
import useProfile from "../../hooks/useProfile";
import { resetPlayerUi, setActiveCardId, setAlertMessage, setPreHotkeyActiveCardGroupId, setReplayStep } from "../store/playerUiSlice";
import { PluginProvider } from "../../contexts/PluginContext";
import store from "../../store";
import ReactModal from "react-modal";

export const Room = ({ slug }) => {
  const dispatch = useDispatch();
  const roomSlug = useSelector(state => state.gameUi.roomSlug);
  const setMessages = useSetMessages();
  const myUser = useProfile();
  const [roomClosed, setRoomClosed] = useState(false);
  const [outOfSync, setOutOfSync] = useState(false);
  const myUserId = myUser?.id;
  //const plugin = usePlugin();
  const [isClosed, setIsClosed] = useState(false);

  const onChannelMessage = useCallback((event, payload) => {
    console.log("onChannelMessage: Got new payload: ", event, payload);
    if (event === "state_update" && payload.delta !== null) {
      // Update store with my own delta
      const newDelta = payload.delta;
      const playerUiReplayStep = store.getState().playerUi.replayStep;
      const oldReplayStep = payload.oldReplayStep;
      const newReplayStep = payload.newReplayStep;
      //const gameUi = store.getState().gameUi;
      console.log("onChannelMessage playerUiReplayStep", playerUiReplayStep, "oldReplayStep", oldReplayStep, "newReplayStep", newReplayStep, newDelta)
      if (oldReplayStep === playerUiReplayStep) {
        dispatch(applyDeltaRedo(newDelta));
        dispatch(setReplayStep(newReplayStep));
        console.log("setmessages1", payload.messages)
        setMessages(payload.messages);
      } else {
        //alert("Game out of sync.")
        setOutOfSync(true);
      }
    } else if (event === "current_state" && payload !== null) {
      const game_ui = payload;
      if (roomSlug !== game_ui.roomSlug) { // Entered a new room
        // Reset player UI
        dispatch(resetPlayerUi())
      }
      // Simulate high ping/lag;
      //delayBroadcast = setTimeout(function() {
      console.log("onChannelMessage: dispatching to game", game_ui)
      dispatch(setGameUi(game_ui));
      const messageByTimestamp = game_ui?.game?.messageByTimestamp;
      if (messageByTimestamp) {
        // Get sorted messages
        const messages = Object.keys(messageByTimestamp).sort().map(key => messageByTimestamp[key]);
        console.log("setmessages2", messages)
        setMessages(messages);
      }
      //setMessages(game_ui.logMessages);
      dispatch(setReplayStep(game_ui.replayStep));

      // If the active card's group has changed due to a hotkey, reset the active card id
      const state = store.getState();
      const activeCardId = state?.playerUi?.activeCardId;
      const preHotkeyActiveCardGroupId = state?.playerUi?.preHotkeyActiveCardGroupId;
      const activeCardGroupId = state?.gameUi?.game?.cardById[activeCardId]?.groupId;
      if (preHotkeyActiveCardGroupId !== null && preHotkeyActiveCardGroupId !== activeCardGroupId) {
        dispatch(setActiveCardId(null));
        dispatch(setPreHotkeyActiveCardGroupId(null));
      }
    } else if (event === "seats_changed" && payload !== null) {
      dispatch(setPlayerInfo(payload));
    } else if (event === "users_changed" && payload !== null) {
      dispatch(setSockets(payload));
    } else if (event === "phx_error") {
      dispatch(setAlertMessage({text: "The server encountered an error. If the issue persists, download the game state JSON file and upload it in a new room.", timestamp: Date.now()}));
      //setRoomClosed(true);
    }

  }, [roomSlug]);

  const onChatMessage = useCallback((event, payload) => {
    if (
      event === "phx_reply" &&
      payload?.response
    ) {      
      console.log("phxmessage new", payload.response)
      const incomingMessage = payload.response.new_message;
      if (!incomingMessage) return;
      console.log("phxmessage", incomingMessage)
      console.log("setmessages3", incomingMessage)
      setMessages([incomingMessage])
    }
  }, []);

  const gameBroadcast = useChannel(`room:${slug}`, onChannelMessage, myUserId);
  console.log("gameb render room", gameBroadcast)

  const chatBroadcast = useChannel(`chat:${slug}`, onChatMessage, myUserId);

  // If game goes out of sync, send a "request_state" message to the server
  if (outOfSync) {
    gameBroadcast("request_state", {});
    setOutOfSync(false);
  }

  console.log('Rendering Room',myUserId);
  // console.log("plugin room",plugin)
  //if (plugin === null) return (<div className="text-white m-4">Loading...</div>);

  if (roomSlug !== slug) return (<div></div>);
  else {
    return (
      <PluginProvider>
        <ReactModal
          closeTimeoutMS={200}
          isOpen={roomClosed}
          onRequestClose={() => setRoomClosed(false)}
          contentLabel="Room Closed"
          overlayClassName="fixed inset-0 bg-black-50  z-10000"
          className="insert-auto p-5 bg-gray-700 border mx-auto rounded-lg my-12 outline-none text-white"
          style={{
            overlay: {
            },
            content: {
              width: '400px',
            }
          }}>
            Your room has closed or timed out. If you were in the middle of playing, it may have crashed. If so, please go to the Menu and download the game state file. Then, create a new room and upload that file to continue where you left off.
        </ReactModal>
        <RoomProviders 
          gameBroadcast={gameBroadcast} 
          chatBroadcast={chatBroadcast}/>
      </PluginProvider>
    );
  }
};
export default Room;
