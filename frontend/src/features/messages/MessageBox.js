import React, { useState, useEffect } from "react";
import ChatMessages from "./MessageLines";
import ChatInput from "./ChatInput";
import useIsLoggedIn from "../../hooks/useIsLoggedIn";
import ReactDOMServer from 'react-dom/server';
import { useMessages } from "../../contexts/MessagesContext";
import { useSelector } from "react-redux";
import { useMessageTextToHtml } from "./MessageLine";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

export const MessageBox = ({ hover, chatBroadcast }) => {
  const newMessageObjects = useMessages();
  const roomName = useSelector(state => state?.gameUi?.game?.roomName);
  const messageTextToHtml = useMessageTextToHtml();
  const [showingLog, setShowingLog] = useState(true);
  const [smoothScroll, setSmoothScroll] = useState(false);

  const [allLogMessageObjects, setAllLogMessageObjects] = useState([]);
  const [allChatMessageObjects, setAllChatMessageObjects] = useState([]);

  const displayedMessages = showingLog ? allLogMessageObjects : allChatMessageObjects;

  console.log("Rendering Chat", displayedMessages)

  const handleShowChatClick = () => {
    setShowingLog(false);
    setSmoothScroll(false);
  } 
  const handleShowLogClick = () => {
    setShowingLog(true);
    setSmoothScroll(false);
  } 

  // Function to generate HTML string
  const generateHTMLString = (messages) => {
    return `<div>
      ${messages.map((m, i) => {
        console.log("exporting message", m)
        const mtth = messageTextToHtml(m.text);
        // Convert to string
        const mtthString = ReactDOMServer.renderToString(mtth);
        console.log("mtth", mtthString);
        // This assumes MessageLine returns a string of HTML
        // You may need to adjust based on how MessageLine is implemented
        return `<div>${mtthString}</div>`; // Replace with actual HTML generation
      }).join('')}
    </div>`;
  };

  // Function to trigger download
  const downloadHTML = (messages) => {
    const htmlString = generateHTMLString(messages);
    const blob = new Blob([htmlString], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = roomName + (showingLog ? "_log" : "_chat") + ".html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const filteredNewChatMessageObjects = newMessageObjects?.filter(obj2 => obj2.sent_by !== -1 && !allChatMessageObjects.find(obj1 => obj1.shortcode === obj2.shortcode));
    const filteredNewLogMessageObjects = newMessageObjects?.filter(obj2 => obj2.sent_by === -1 && !allLogMessageObjects.find(obj1 => obj1.shortcode === obj2.shortcode));
    console.log("MessageBox useEffect", {newMessageObjects, filteredNewLogMessageObjects, allLogMessageObjects})

    if (newMessageObjects) setAllChatMessageObjects([...allChatMessageObjects, ...filteredNewChatMessageObjects])
    if (newMessageObjects) setAllLogMessageObjects([...allLogMessageObjects, ...filteredNewLogMessageObjects])
  }, [newMessageObjects]);

  return (
    <div className="overflow-hidden h-full">
      <div className="bg-gray-900 overflow-y-auto" style={{height: `calc(100% - ${showingLog ? 3 : 6}vh)`}}>
        <ChatMessages hover={hover} messages={displayedMessages}/>
      </div>
      {!showingLog && <div className="text-center float-left" style={{height: "3vh", width: "100%"}}>
        <ChatInput chatBroadcast={chatBroadcast}/>
      </div>}
      <div 
        className={`flex items-center justify-center float-left text-white p-1 ${showingLog ? "bg-gray-500" : "bg-gray-700"} hover:bg-gray-400 select-none`}
        style={{height: "3vh", width: "calc(50% - 1.5vh)", animation: smoothScroll ? "glowing 1s infinite ease" : ""}}
        onClick={() => handleShowLogClick()}>
        <div className="">Log</div>
      </div>
      <div 
        className={`flex items-center justify-center float-left text-white ${showingLog ? "bg-gray-700" : "bg-gray-500"} hover:bg-gray-400 select-none`  }
        style={{height: "3vh", width: "calc(50% - 1.5vh)", animation: smoothScroll ? "glowing 1s infinite ease" : ""}}
        onClick={() => handleShowChatClick()}>
        Chat
      </div>
      <div 
        className="flex items-center justify-center float-left border-l text-white bg-gray-900 hover:bg-red-700" onClick={(e) => {e.stopPropagation(); downloadHTML(displayedMessages)}}
        style={{height: "3vh", width: "3vh", animation: smoothScroll ? "glowing 1s infinite ease" : ""}}>
          <FontAwesomeIcon icon={faDownload}/>
      </div>
    </div>

  );
};
export default React.memo(MessageBox);
