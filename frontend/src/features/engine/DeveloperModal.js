import React, { useState } from "react";
import Draggable from "react-draggable";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import { useDispatch } from "react-redux";
import { setTyping } from "../store/playerUiSlice";
import Button from "../../components/basic/Button";
import { useDoActionList } from "./hooks/useDoActionList";

const DeveloperModal = () => {
  const dispatch = useDispatch();
  dispatch(setTyping(true));
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const doActionList = useDoActionList();

  const handleClick = () => {
    try {
      const parsedCode = JSON.parse(input);
      setCode(parsedCode);
      doActionList(parsedCode);
    } catch (e) {
      alert("Invalid JSON");
    }
  };

  return (
    <Draggable handle=".handle">
      <div style={{ position: "absolute", zIndex: 10000, cursor: "move", width: "40vw"}}>
        <div className="handle" style={{ background: 'grey', width: '100%', cursor: 'move', height: '40px' }}></div>
        <CodeMirror
          value={input}
          options={{
            lineNumbers: true,
            mode: { name: "javascript", json: true },
          }}
          onBeforeChange={(editor, data, value) => {
            setInput(value);
          }}
          className="h-full"
        />
        <Button onClick={handleClick}>Run</Button>
      </div>
    </Draggable>
  );  
};

export default DeveloperModal;
