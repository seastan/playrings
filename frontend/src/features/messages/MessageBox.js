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
import { ChatDiv } from "./ChatDiv";
import { LogDiv } from "./LogDiv";
import { faComment, faFileLines, faRectangleList } from "@fortawesome/free-regular-svg-icons";
import { MessageBoxButton } from "./MessageBoxButton";
import { LogButtons } from "./LogButtons";

export const MessageBox = ({ hover }) => {
  const newMessageObjects = useMessages();
  const roomName = useSelector(state => state?.gameUi?.game?.roomName);
  const deltas = useSelector(state => state?.gameUi?.deltas);
  const replayStep = useSelector(state => state?.gameUi?.replayStep);
  const messageTextToHtml = useMessageTextToHtml();
  const [showingLog, setShowingLog] = useState(true);
  const [smoothScroll, setSmoothScroll] = useState(false);

  const [allLogMessageObjects, setAllLogMessageObjects] = useState([]);
  const [allChatMessageObjects, setAllChatMessageObjects] = useState([]);

  const displayedMessages = showingLog ? allLogMessageObjects : allChatMessageObjects;

  console.log("Rendering Chat", displayedMessages)

  const handleShowChatClick = () => {
    console.log("handleShowChatClick")
    setShowingLog(false);
    setSmoothScroll(false);
  } 
  const handleShowLogClick = () => {
    console.log("handleShowLogClick")
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
    <div className="overflow-hidden h-full bg-gray-900">
      <div className="overflow-y-auto" style={{height: `calc(100% - 3vh)`}}>
        {showingLog && <LogDiv hover={hover}/>}
        {!showingLog && <ChatDiv hover={hover}/>}
      </div>
      <div 
        className={`flex items-center float-left w-full text-white select-none`}
        style={{height: "3vh", borderTop: "1px solid white"}}
      >
        <div className="flex px-2">
          <MessageBoxButton selected={showingLog} clickCallback={handleShowLogClick} icon={faRectangleList}/>
          <MessageBoxButton selected={!showingLog} clickCallback={handleShowChatClick} icon={faComment}/>
        </div>
        <div
          className={"h-full w-full px-2"}
          style={{borderLeft: "1px solid white"}}
        >
          {showingLog && <LogButtons/>}
        </div>
      </div>
      {/* <div 
        className={`flex items-center justify-center float-left text-white ${showingLog ? "bg-gray-700" : "bg-gray-500"} hover:bg-gray-400 select-none`  }
        style={{height: "3vh", width: "calc(50% - 1.5vh)", animation: smoothScroll ? "glowing 1s infinite ease" : ""}}
        onClick={() => handleShowChatClick()}>
        Chat
      </div>
      <div 
        className="flex items-center justify-center float-left border-l text-white bg-gray-900 hover:bg-red-700" onClick={(e) => {e.stopPropagation(); downloadHTML(displayedMessages)}}
        style={{height: "3vh", width: "2.99vh", animation: smoothScroll ? "glowing 1s infinite ease" : ""}}>
          <FontAwesomeIcon icon={faDownload}/>
      </div> */}
    </div>

  );
};
export default React.memo(MessageBox);
