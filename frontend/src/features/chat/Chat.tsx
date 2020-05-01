import React, { useState, useCallback } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import useChannel from "../../hooks/useChannel";
import useIsLoggedIn from "../../hooks/useIsLoggedIn";
import { ChatMessage } from "elixir-backend";

interface Props {
  roomName: string;
}

export const Chat: React.FC<Props> = ({ roomName }) => {
  const isLoggedIn = useIsLoggedIn();
  const [messages, setMessages] = useState<Array<ChatMessage>>([]);
  const onChannelMessage = useCallback((event, payload) => {
    if (
      event === "phx_reply" &&
      payload.response != null &&
      payload.response.messages != null
    ) {
      setMessages(payload.response.messages);
    }
  }, []);
  const broadcast = useChannel(`chat:${roomName}`, onChannelMessage);

  return (
    <div className="w-full">
      Chat
      <div className="mb-2">
        <ChatMessages messages={messages} className="h-128" />
      </div>
      {isLoggedIn && <ChatInput broadcast={broadcast} />}
    </div>
  );
};
export default Chat;
