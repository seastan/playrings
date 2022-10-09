import React, { useState, useCallback, useEffect } from "react";
import ChatMessages from "./MessageLines";
import ChatInput from "./ChatInput";
import useIsLoggedIn from "../../hooks/useIsLoggedIn";
import { useMessages } from "../../contexts/MessagesContext";
import { useSelector } from "react-redux";

export const MessageBox = ({ hover, chatBroadcast, setTyping }) => {
  const allChatMessages = useMessages();
  const [showingLog, setShowingLog] = useState(true);
  const [smoothScroll, setSmoothScroll] = useState(false);
  const newLogMessages = useSelector(state => state?.gameUi?.game?.messages);
  const [allLogMessages, setAllLogMessages] = useState([]);

  console.log("Rendering Chat")

  const handleShowChatClick = () => {
    setShowingLog(!showingLog);
    setSmoothScroll(false);
  } 

  useEffect(() => {
    setAllLogMessages([...allLogMessages, ...newLogMessages])
  }, [newLogMessages]);

  return (
    <div className="overflow-hidden h-full">
      <div className="bg-gray-800 overflow-y-auto" style={{height: "calc(100% - 3vh)"}}>
        <ChatMessages hover={hover} messages={showingLog ? allLogMessages : allChatMessages}/>
      </div>
      <div 
        className="flex items-center justify-center float-left text-white bg-gray-700 hover:bg-gray-600 select-none"  
        style={{height: "3vh", width: showingLog ? "100%" : "20%", animation: smoothScroll ? "glowing 1s infinite ease" : ""}}
        onClick={() => handleShowChatClick()}>
        {showingLog ? "Chat" : "Log"}
      </div>
      {!showingLog && <div className="text-center float-left"  style={{height: "3vh", width: "80%"}}>
        <ChatInput chatBroadcast={chatBroadcast}/>
      </div>}
    </div>

  );
};
export default React.memo(MessageBox);
