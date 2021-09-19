import React from "react";
//import React, { useState, useEffect, useContext } from "react";
//import cx from "classnames";

import useForm from "../../hooks/useForm";

interface Props {
  chatBroadcast: (eventName: string, payload: object) => void;
  setTyping: React.Dispatch<React.SetStateAction<Boolean>>
}

export const ChatInput: React.FC<Props> = ({ chatBroadcast, setTyping }) => {
  const { inputs, handleSubmit, handleInputChange, setInputs } = useForm(
    async () => {
      chatBroadcast("message", { message: inputs.chat });
      setInputs((inputs) => ({
        ...inputs,
        chat: "",
      }));
    }
  );
  return (
    <form className="h-full" onSubmit={handleSubmit}>
      <input
        type="text"
        name="chat"
        placeholder="your message..."
        className="form-control w-full bg-gray-900 text-white border-0 h-full"
        onFocus={event => setTyping(true)}
        onBlur={event => setTyping(false)}
        onChange={handleInputChange}
        value={inputs.chat || ""}
      />
    </form>
  );
};
export default ChatInput;
