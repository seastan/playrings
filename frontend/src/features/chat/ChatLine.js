import React from "react";
import UserName from "../user/UserName";
import { useSelector } from "react-redux";
import { usePlayerIList } from "../engine/functions/usePlayerIList";


export const ChatLine = ({ message }) => {
  const cleanText = message.text.replace(/<\/?.+?>/ig, '');
  const playerInfo = useSelector(state => state?.gameUi?.playerInfo);
  const numPlayers = useSelector(state => state?.gameUi?.game?.numPlayers);
  const playerIList = usePlayerIList();
  var processedText = cleanText;
  for (var playerI of playerIList) {
    processedText = processedText.replace("{"+playerI+"}", playerInfo?.player1?.alias);
  }

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
        <span className="text-blue-400">
          <UserName userID={message.sent_by} />
        </span>
        <span className="text-white"> {cleanText}</span>
      </div>
    )
  }

};
export default ChatLine;
