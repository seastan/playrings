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

    <div className="overflow-hidden h-full">
      <div className="bg-gray-800 overflow-y-auto rounded-lg" style={{height: "calc(100% - 32px)"}}>
        <ChatMessages messages={messages}/>
      </div>
      <div className="text-center" >
        {isLoggedIn && <ChatInput broadcast={broadcast} />}
      </div>
    </div>


    // <div className="flex flex-1 flex-col h-full w-full">
    //   <div className="flex flex-grow flex-col mb-2 max-h-full">
    //     <ChatMessages messages={messages} className="flex" />
    //   </div>
    //   {isLoggedIn && <ChatInput broadcast={broadcast} />}
    // </div>
  );
};
export default Chat;
