import React, { useState, useEffect } from "react";
import { DropdownMenuCommon } from "./DropdownMenuCommon";
import { useMousePosition } from "../../contexts/MousePositionContext";
import { useDropdownMenu, useSetDropdownMenu } from "../../contexts/DropdownMenuContext";

import "../../css/custom-dropdown.css";
import { useTouchAction } from "../../contexts/TouchActionContext";
import { useSelector } from "react-redux";

export const DropdownMenu = React.memo(({
  gameBroadcast,
  chatBroadcast,
}) => {
  const playerN = useSelector(state => state?.roomUi?.playerN);
  const dropdownMenuObj = useSelector(state => state?.roomUi?.dropdownMenuObj);
  const touchAction = useSelector(state => state?.roomUi?.touchAction);
  const mousePosition = useSelector(state => state?.roomUi?.mousePosition);
  
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0); 
  const [isNull, setIsNull] = useState(true);

  useEffect(() => {
    setMouseX(mousePosition?.x);
    setMouseY(mousePosition?.y);
    setIsNull(dropdownMenuObj === null);
  }, [dropdownMenuObj])


  console.log("Rendering DropdownMenu ",mousePosition,dropdownMenuObj,isNull,touchAction);
  if (!mousePosition) return null;
  if (!dropdownMenuObj) return null;
  if (isNull) return null;
  if (touchAction) return null;

  return (
    <DropdownMenuCommon
      playerN={playerN}
      gameBroadcast={gameBroadcast}
      chatBroadcast={chatBroadcast}
      mouseX={mouseX}
      mouseY={mouseY}
    />
  )

})