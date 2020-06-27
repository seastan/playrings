import React from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import ChatMessagesInner from "./ChatMessagesInner";
import { ChatMessage } from "elixir-backend";

interface Props {
  messages: Array<ChatMessage>;
  className?: string;
}

export const ChatMessages: React.FC<Props> = ({ messages, className }) => {
  return (
    <ScrollToBottom
      className="bg-grey-700 max-w-full p-2 overflow-y-auto h-full"
    >
      <ChatMessagesInner messages={messages} />
    </ScrollToBottom>
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
