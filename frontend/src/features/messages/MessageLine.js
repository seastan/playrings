import React from "react";
import UserName from "../user/UserName";
import { useSelector } from "react-redux";
import { usePlayerIList } from "../engine/functions/usePlayerIList";


export const MessageLine = ({ message }) => {
  const cleanText = message.text.replace(/<\/?.+?>/ig, '');
  const playerInfo = useSelector(state => state?.gameUi?.playerInfo);
  const playerIList = usePlayerIList();
  var processedText = cleanText;
  for (var playerI of playerIList) {
    processedText = processedText.replace(playerI, playerInfo[playerI]?.alias);
  }
  console.log("Rendering ChatLine",processedText)

  if (message.game_update) {
    return (
      <div className="ml-2">
        <span className="text-white"> 
          {/* <span className="text-gray-400 font-bold"><UserName userID={message.sent_by}/> </span>  */}
          {processedText}
        </span>
      </div>
    )
  } else {
    return (
      <div className="ml-2">
        {message.sent_by && <span className="text-blue-400">
          <UserName userID={message.sent_by} />
        </span>}
        <span className="text-white"> {processedText}</span>
      </div>
    )
  }

};
export default MessageLine;
