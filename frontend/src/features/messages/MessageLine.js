import React from "react";
import UserName from "../user/UserName";
import { useSelector } from "react-redux";
import { usePlayerIList } from "../engine/hooks/usePlayerIList";


export const MessageLine = ({ message }) => {
  console.log("Rendering MessageLine",message)
  const cleanText = message.text.replace(/<\/?.+?>/ig, '');
  const playerInfo = useSelector(state => state?.gameUi?.playerInfo);
  const playerIList = usePlayerIList();
  var processedText = cleanText;
  for (var playerI of playerIList) {
    processedText = processedText.replace(playerI, playerInfo[playerI]?.alias || playerI);
  }
  console.log("Rendering MessageLine",processedText)
  return (
    <div className="ml-2">
      {message.sent_by > 0 && <span className="text-blue-400">
        <UserName userID={message.sent_by} />
      </span>}
      <span className={processedText.startsWith("ERROR:") ? "text-red-500" : "text-white"}> {processedText}</span>
    </div>
  )

};
export default MessageLine;
