import React, { useState, useEffect } from "react";
import { DropdownMenuCommon } from "./DropdownMenuCommon";

import "../../css/custom-dropdown.css";
import { useSelector } from "react-redux";

export const DropdownMenu = React.memo(({}) => {
  const dropdownMenu = useSelector(state => state?.playerUi?.dropdownMenu);
  const touchAction = useSelector(state => state?.playerUi?.touchAction);
  const mouseXY = useSelector(state => state?.playerUi?.mouseXY);
  
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0); 
  const [isNull, setIsNull] = useState(true);

  useEffect(() => {
    setMouseX(mouseXY?.x);
    setMouseY(mouseXY?.y);
    setIsNull(dropdownMenu === null);
  }, [dropdownMenu])


  console.log("Rendering DropdownMenu ",mouseXY,dropdownMenu,isNull,touchAction);
  if (!mouseXY) return null;
  if (!dropdownMenu) return null;
  if (isNull) return null;
  if (touchAction) return null;

  return (
    <DropdownMenuCommon
      mouseX={mouseX}
      mouseY={mouseY}
    />
  )

})