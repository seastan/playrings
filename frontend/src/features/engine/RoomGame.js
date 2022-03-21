import React from "react";
import { useSelector } from 'react-redux';
import { HandleKeyDown } from "../plugin/HandleKeyDown";
import { DragContainer } from "./DragContainer";
import { HandleTouchActions } from "./functions/HandleTouchActions";

const RoomGame = React.memo(({ gameBroadcast, chatBroadcast }) => {
  console.log('Rendering RoomGame');
  const touchMode = useSelector(state => state?.playerUi.touchMode);

  // useEffect(() => {
  //   const onKeyUp = (event) => {
  //     if (event.key === "Alt") setKeypress({"Alt": 0});
  //     if (event.key === " ") setKeypress({"Space": 0});
  //     if (event.key === "Control") setKeypress({"Control": 0});
  //     if (event.key === "Tab") setKeypress({"Tab": 0});
  //   }

  //   document.addEventListener('keyup', onKeyUp);

  //   return () => {
  //       document.removeEventListener('keyup', onKeyUp);
  //   }
  // }, []);

  return (
    <div className="h-full w-full">
      <HandleKeyDown
        gameBroadcast={gameBroadcast} 
        chatBroadcast={chatBroadcast}
      />   
      {touchMode && <HandleTouchActions
        gameBroadcast={gameBroadcast} 
        chatBroadcast={chatBroadcast}
      />}
      <DragContainer 
        gameBroadcast={gameBroadcast}
        chatBroadcast={chatBroadcast}
      />
    </div>
  )
})

export default RoomGame;
