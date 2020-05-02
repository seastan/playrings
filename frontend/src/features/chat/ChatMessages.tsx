import React from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import ChatMessagesInner from "./ChatMessagesInner";
import { ChatMessage } from "elixir-backend";
import cx from "classnames";

interface Props {
  messages: Array<ChatMessage>;
  className?: string;
}

export const ChatMessages: React.FC<Props> = ({ messages, className }) => {
  return (
    <ScrollToBottom
      className={cx(
        "bg-white border rounded p-2 overflow-y-auto",
        className || "h-32"
      )}
    >
      <ChatMessagesInner messages={messages} />
    </ScrollToBottom>
  );
};
export default ChatMessages;
