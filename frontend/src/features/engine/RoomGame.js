import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { HandleKeyDown } from "../plugins/lotrlcg/components/HandleKeyDown";
import { setKeypress } from "../store/playerUiSlice";
import { DragContainer } from "./DragContainer";
import { HandleTouchActions } from "./functions/HandleTouchActions";
import { useKeyDown } from "./functions/useKeyDown";

const RoomGame = React.memo(({}) => {
  console.log('Rendering RoomGame');
  const dispatch = useDispatch();
  const touchMode = useSelector(state => state?.playerUi.touchMode);
  const typing = useSelector(state => state?.playerUi.typing);
  const onKeyDown = useKeyDown();

  useEffect(() => {
    
    const onKeyUp = (event) => {
      const k = event.key;
      if (k === "Alt") dispatch(setKeypress({"Alt": 0}));
      if (k === " ") dispatch(setKeypress({"Space": 0}));
      if (k === "Control") dispatch(setKeypress({"Control": 0}));
      if (k === "Shift") dispatch(setKeypress({"Shift": 0}));
      if (k === "Tab") dispatch(setKeypress({"Tab": 0}));
    }

    if (!typing) {
      document.addEventListener('keyup', onKeyUp);
      document.addEventListener('keydown', onKeyDown);
    }

    return () => {
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('keydown', onKeyDown);
    }
  }, [onKeyDown]); //, typing]);

  return (
    <div className="h-full w-full">
{/*       <HandleKeyDown/>   
 */}      {touchMode && <HandleTouchActions/>}
      <DragContainer/>
    </div>
  )
})

export default RoomGame;
