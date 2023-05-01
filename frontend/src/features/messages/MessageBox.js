import React, { useState, useEffect } from "react";
import ChatMessages from "./MessageLines";
import ChatInput from "./ChatInput";
import useIsLoggedIn from "../../hooks/useIsLoggedIn";
import { useMessages } from "../../contexts/MessagesContext";
import { useSelector } from "react-redux";

export const MessageBox = ({ hover, chatBroadcast }) => {
  const newMessageObjects = useMessages();
  const [showingLog, setShowingLog] = useState(true);
  const [smoothScroll, setSmoothScroll] = useState(false);

  const [allLogMessageObjects, setAllLogMessageObjects] = useState([]);
  const [allChatMessageObjects, setAllChatMessageObjects] = useState([]);

  console.log("Rendering Chat", newMessageObjects)

  const handleShowChatClick = () => {
    setShowingLog(!showingLog);
    setSmoothScroll(false);
  } 

  useEffect(() => {
    const filteredNewChatMessageObjects = newMessageObjects?.filter(obj2 => obj2.sent_by !== -1 && !allChatMessageObjects.find(obj1 => obj1.shortcode === obj2.shortcode));
    const filteredNewLogMessageObjects = newMessageObjects?.filter(obj2 => obj2.sent_by === -1 && !allLogMessageObjects.find(obj1 => obj1.shortcode === obj2.shortcode));
    console.log("MessageBox useEffect", {newMessageObjects, filteredNewLogMessageObjects, allLogMessageObjects})

    if (newMessageObjects) setAllChatMessageObjects([...allChatMessageObjects, ...filteredNewChatMessageObjects])
    if (newMessageObjects) setAllLogMessageObjects([...allLogMessageObjects, ...filteredNewLogMessageObjects])
  }, [newMessageObjects]);

  return (
    <div className="overflow-hidden h-full">
      <div className="bg-gray-800 overflow-y-auto" style={{height: "calc(100% - 3vh)"}}>
        <ChatMessages hover={hover} messages={showingLog ? allLogMessageObjects : allChatMessageObjects}/>
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
