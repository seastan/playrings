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
  const onKeyDown = useKeyDown();

  useEffect(() => {
    const onKeyUp = (event) => {
      if (event.key === "Alt") dispatch(setKeypress({"Alt": 0}));
      if (event.key === " ") dispatch(setKeypress({"Space": 0}));
      if (event.key === "Control") dispatch(setKeypress({"Control": 0}));
      if (event.key === "Shift") dispatch(setKeypress({"Shift": 0}));
      if (event.key === "Tab") dispatch(setKeypress({"Tab": 0}));
    }

    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('keydown', onKeyDown);
    }
  }, []);

  return (
    <div className="h-full w-full">
{/*       <HandleKeyDown/>   
 */}      {touchMode && <HandleTouchActions/>}
      <DragContainer/>
    </div>
  )
})

export default RoomGame;
