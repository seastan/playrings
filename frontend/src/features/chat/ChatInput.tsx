import React from "react";
//import React, { useState, useEffect, useContext } from "react";
//import cx from "classnames";

import useForm from "../../hooks/useForm";

interface Props {
  broadcast: (eventName: string, payload: object) => void;
}

export const ChatInput: React.FC<Props> = ({ broadcast }) => {
  const { inputs, handleSubmit, handleInputChange, setInputs } = useForm(
    async () => {
      broadcast("message", { message: inputs.chat });
      setInputs((inputs) => ({
        ...inputs,
        chat: "",
      }));
    }
  );
  return (
    <div className="">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="chat"
          placeholder="your message.."
          className="form-control w-full bg-gray-900 text-white border-0"
          onChange={handleInputChange}
          value={inputs.chat || ""}
        />
      </form>
    </div>
  );
};
export default ChatInput;
