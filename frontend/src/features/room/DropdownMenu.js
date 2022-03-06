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
  const playerN = useSelector(state => state?.playerUi?.playerN);
  const dropdownMenuObj = useSelector(state => state?.playerUi?.dropdownMenuObj);
  const touchAction = useSelector(state => state?.playerUi?.touchAction);
  const mousePosition = useSelector(state => state?.playerUi?.mousePosition);
  
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
      gameBroadcast={gameBroadcast}
      chatBroadcast={chatBroadcast}
      mouseX={mouseX}
      mouseY={mouseY}
    />
  )

})