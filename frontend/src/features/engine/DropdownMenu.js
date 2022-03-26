import React, { useState, useEffect } from "react";
import { DropdownMenuCommon } from "./DropdownMenuCommon";

import "../../css/custom-dropdown.css";
import { useSelector } from "react-redux";

export const DropdownMenu = React.memo(({}) => {
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
      mouseX={mouseX}
      mouseY={mouseY}
    />
  )

})