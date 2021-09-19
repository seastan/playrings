import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { useKeypress, useSetKeypress} from "../../contexts/KeypressContext";
import { HandleKeyDown } from "./HandleKeyDown";
import { DragContainer } from "./DragContainer";
import { HandleTouchActions } from "./HandleTouchActions";
import { useTouchMode } from "../../contexts/TouchModeContext";
import { HandleGameChange } from "./HandleGameChange";

const RoomGame = React.memo(({ playerN, gameBroadcast, chatBroadcast }) => {
  console.log('Rendering RoomGame');
  const [typing, setTyping] = useState(false);
  const setKeypress = useSetKeypress();
  const touchMode = useTouchMode();

  useEffect(() => {
    const onKeyUp = (event) => {
      if (event.key === "Alt") setKeypress({"Alt": 0});
      if (event.key === " ") setKeypress({"Space": 0});
      if (event.key === "Control") setKeypress({"Control": 0});
      if (event.key === "Tab") setKeypress({"Tab": 0});
    }

    document.addEventListener('keyup', onKeyUp);

    return () => {
        document.removeEventListener('keyup', onKeyUp);
    }
  }, []);

  return (
    <div className="h-full w-full">
      <HandleKeyDown
        playerN={playerN}
        typing={typing}
        gameBroadcast={gameBroadcast} 
        chatBroadcast={chatBroadcast}
      />   
      <HandleGameChange
        playerN={playerN}
        typing={typing}
        gameBroadcast={gameBroadcast} 
        chatBroadcast={chatBroadcast}
      />      
      {touchMode && <HandleTouchActions
        playerN={playerN}
        gameBroadcast={gameBroadcast} 
        chatBroadcast={chatBroadcast}
      />}
      <DragContainer 
        playerN={playerN}
        gameBroadcast={gameBroadcast}
        chatBroadcast={chatBroadcast}
        setTyping={setTyping}
      />
    </div>
  )
})

export default RoomGame;
