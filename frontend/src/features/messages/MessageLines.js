import React, { useRef, useEffect, useState } from "react";
import MessageLine from "./MessageLine";
import { useMessages } from "../../contexts/MessagesContext";
import { useSelector } from "react-redux";

export const MessageLines = ({ hover, messages }) => {
  const touchMode = useSelector(state => state?.playerUi?.userSettings?.touchMode);
  const bottomRef = useRef();
  console.log("Rendering ChatMessages", messages)

  const scrollToBottom = () => {
    if (bottomRef?.current)
      bottomRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  useEffect(() => {
    if (!touchMode) scrollToBottom();
  }, [messages, hover, touchMode])

  return (
    <div>
      {messages?.map((m, i) => {
        return(<MessageLine key={i} message={m} />)
      })}
      <div ref={bottomRef} className="list-bottom"></div>
    </div>
  );

};
export default MessageLines;


// import React from "react";
// import ScrollToBottom from "react-scroll-to-bottom";
// import ChatMessagesInner from "./ChatMessagesInner";
// import { ChatMessage } from "elixir-backend";
// import cx from "classnames";

// interface Props {
//   messages: Array<ChatMessage>;
//   className?: string;
// }

// export const ChatMessages: React.FC<Props> = ({ messages, className }) => {
//   return (
//     // <ScrollToBottom
//     //   className={cx(
//     //     "bg-gray-700 rounded p-2 overflow-hidden",
//     //     className
//     //   )}
//     // >
//       <ChatMessagesInner messages={messages} />
//     // </ScrollToBottom>
//   );
// };
// export default ChatMessages;
