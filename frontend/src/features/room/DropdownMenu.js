import React, { useState, useEffect } from "react";
import { DropdownMenuCommon } from "./DropdownMenuCommon";
import { useMousePosition } from "../../contexts/MousePositionContext";
import { useDropdownMenu, useSetDropdownMenu } from "../../contexts/DropdownMenuContext";

import "../../css/custom-dropdown.css";
import { useTouchAction } from "../../contexts/TouchActionContext";

export const DropdownMenu = React.memo(({
  playerN,
  gameBroadcast,
  chatBroadcast,
}) => {
  const mousePosition = useMousePosition();
  const dropdownMenu = useDropdownMenu();
  const setDropdownMenu = useSetDropdownMenu();
  const touchAction = useTouchAction();
  
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0); 
  console.log("Rendering DropdownMenu ");

  useEffect(() => {
    setMouseX(mousePosition?.x);
    setMouseY(mousePosition?.y);
  }, [dropdownMenu])

  if (!mousePosition) return null;
  if (!dropdownMenu) return null;
  if (touchAction) return null;

  return (
    <DropdownMenuCommon
      playerN={playerN}
      gameBroadcast={gameBroadcast}
      chatBroadcast={chatBroadcast}
      mouseX={mouseX}
      mouseY={mouseY}
      dropdownMenu={dropdownMenu}
      setDropdownMenu={setDropdownMenu}
    />
  )

})