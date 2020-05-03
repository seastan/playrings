import React from "react";
import UserName from "../user/UserName";
import { ChatMessage } from "elixir-backend";

interface Props {
  message: ChatMessage;
}

export const ChatLine: React.FC<Props> = ({ message }) => {
  return (
    <div>
      <span className="text-gray-500">&lt;</span>
      <span className="text-blue-400">
        <UserName userId={message.sent_by} />
      </span>
      <span className="text-gray-500">&gt;</span> 
      <span className="text-white"> {message.text}</span>
    </div>
  );
};
export default ChatLine;
