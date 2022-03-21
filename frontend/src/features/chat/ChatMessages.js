import React, { useRef, useEffect } from "react";
import ChatLine from "./ChatLine";
import { useMessages } from "../../contexts/MessagesContext";
import { useSelector } from "react-redux";

export const ChatMessages = ({ hover, chatOnly }) => {
  console.log("Rendering ChatMessages")
  const messages = useMessages();
  const touchMode = useSelector(state => state?.playerUi?.touchMode);

  const bottomRef = useRef();

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
        if (chatOnly && m.game_update) return null;
        if (!chatOnly && !m.game_update) return null;
        return(<ChatLine key={m.shortcode} message={m} />)
      })}
      <div ref={bottomRef} className="list-bottom"></div>
    </div>
  );

};
export default ChatMessages;


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
