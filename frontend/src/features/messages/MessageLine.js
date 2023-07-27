import React from "react";
import UserName from "../user/UserName";
import { useSelector } from "react-redux";
import { usePlayerIList } from "../engine/hooks/usePlayerIList";
import { useGameDefinition } from "../engine/hooks/useGameDefinition";
import useProfile from "../../hooks/useProfile";


export const MessageLine = ({ message }) => {
  console.log("Rendering MessageLine",message)
  const cleanText = message.text.replace(/<\/?.+?>/ig, '');
  const playerInfo = useSelector(state => state?.gameUi?.playerInfo);
  const gameDef = useGameDefinition();
  const playerIList = usePlayerIList();
  const user = useProfile();
  const language = user?.language || "English";
  var processedText = cleanText;
  for (var playerI of playerIList) {
    // Replace all occurances of {playerN} with the player's alias
    processedText = processedText.replace(new RegExp(`{${playerI}}`, 'g'), playerInfo?.[playerI]?.alias || playerI);
    processedText = processedText.replace(/id:([a-zA-Z0-9_\-]+(\.[a-zA-Z0-9_\-]+)*)/g, function(match, p1) {
      console.log("getting label",match,p1,gameDef?.labels?.[language]?.[p1])
      return gameDef?.labels?.[p1]?.[language] || p1;
    });
  }
  return (
    <div className="ml-2">
      {message.sent_by > 0 && <span className="text-blue-400">
        <UserName userID={message.sent_by} />
      </span>}
      <span className={processedText.startsWith("Error:") ? "text-red-500" : "text-white"}> {processedText}</span>
    </div>
  )

};
export default MessageLine;
