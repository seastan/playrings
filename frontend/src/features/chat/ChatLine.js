import React from "react";
import UserName from "../user/UserName";
import { useSelector } from "react-redux";


export const ChatLine = ({ message }) => {
  const cleanText = message.text.replace(/<\/?.+?>/ig, '');
  const playerInfo = useSelector(state => state?.gameUi?.playerInfo);
  const numPlayer = useSelector(state => state?.gameUi?.num);

  if (message.game_update) {
    return (
      <div className="ml-2">
        <span className="text-white"> 
          <span className="text-gray-400 font-bold"><UserName userID={message.sent_by}/> </span> 
          {cleanText}
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
