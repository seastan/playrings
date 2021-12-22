import React from "react";
import UserName from "../user/UserName";
import { ChatMessage } from "elixir-backend";

interface Props {
  message: ChatMessage;
}

export const ChatLine: React.FC<Props> = ({ message }) => {
  if (message.game_update) {
    return (
      <div className="ml-2">
        <span className="text-white"> 
          <span className="text-gray-400 font-bold"><UserName userID={message.sent_by}/> </span> 
          {message.text}
        </span>
      </div>
    )
  } else {
    return (
      <div className="ml-2">
        <span className="text-blue-400">
          <UserName userID={message.sent_by} />
        </span>
        <span className="text-white"> {message.text}</span>
      </div>
    )
  }

};
export default ChatLine;
