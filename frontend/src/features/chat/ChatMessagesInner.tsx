import React from "react";
import ChatLine from "./ChatLine";
import { ChatMessage } from "elixir-backend";

interface Props {
  messages: Array<ChatMessage>;
}

export const ChatMessagesInner: React.FC<Props> = ({ messages }) => {
  return (
    <div>
      {messages.map((m, i) => (
        <ChatLine key={m.shortcode} message={m} />
      ))}
    </div>
  );
};
export default ChatMessagesInner;
