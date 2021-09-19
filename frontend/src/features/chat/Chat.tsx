import React, { useState, useCallback, useEffect } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import useChannel from "../../hooks/useChannel";
import useIsLoggedIn from "../../hooks/useIsLoggedIn";
import { ChatMessage } from "elixir-backend";
import { useMessages } from "../../contexts/MessagesContext";
import { CSSTransition } from 'react-transition-group';

interface Props {
  hover: boolean;
  chatBroadcast: (eventName: string, payload: object) => void;
  setTyping: React.Dispatch<React.SetStateAction<Boolean>>
}

export const Chat: React.FC<Props> = ({ hover, chatBroadcast, setTyping }) => {
  const isLoggedIn = useIsLoggedIn();
  const messages = useMessages();
  const [chatOnly, setChatOnly] = useState(false);
  const [newChatMessage, setNewChatMessage] = useState(false);
  console.log("Rendering Chat")

  const handleChatOnlyClick = () => {
    setChatOnly(!chatOnly);
    setNewChatMessage(false);
  }

  useEffect(() => {
    const lastMessage = messages?.[messages.length-1];
    if (lastMessage && !lastMessage.game_update) {
      if (!chatOnly) setNewChatMessage(true);
    }
  }, [messages]);

  return (
    <div className="overflow-hidden h-full">
      <div className="bg-gray-800 overflow-y-auto" style={{height: "calc(100% - 3vh)"}}>
        <ChatMessages hover={hover} chatOnly={chatOnly}/>
      </div>
      <div 
        className="flex items-center justify-center float-left text-white bg-gray-700 hover:bg-gray-600 select-none"  
        style={{height: "3vh", width: chatOnly ? "20%" : "100%", animation: newChatMessage ? "glowing 2s infinite ease" : ""}}
        onClick={() => handleChatOnlyClick()}>
        {chatOnly ? "Log" : "Chat"}
      </div>
      {chatOnly && <div className="text-center float-left"  style={{height: "3vh", width: "80%"}}>
        <ChatInput chatBroadcast={chatBroadcast} setTyping={setTyping}/>
      </div>}
    </div>

  );
};
export default React.memo(Chat);
