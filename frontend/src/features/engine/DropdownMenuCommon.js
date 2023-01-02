import React, { useState } from "react";
import { useDropdownClickCommon } from "../plugins/lotrlcg/functions/dropdownMenuClick";
import { DropdownMenuCard } from "./DropdownMenuCard";
import { DropdownMenuGroup } from "./DropdownMenuGroup";
import { DropdownMenuFirstPlayer } from "./DropdownMenuFirstPlayer";
import { useDispatch, useSelector } from 'react-redux';
import { calcHeightCommon } from "./DropdownMenuHelpers";
import "../../css/custom-dropdown.css";
import { setDropdownMenuObj } from "../store/playerUiSlice";
import { useDoActionList } from "./functions/useDoActionList";

export const DropdownMenuCommon = React.memo(({
  mouseX,
  mouseY,
}) => {
  
  const dispatch = useDispatch();
  const dropdownMenuObj = useSelector(state => state?.playerUi?.dropdownMenuObj)
  const [activeMenu, setActiveMenu] = useState('main');
  const [menuHeight, setMenuHeight] = useState(null);
  const dropdownClickCommon = useDropdownClickCommon;
  const doActionList = useDoActionList();

  const calcHeight = (el) => {
    calcHeightCommon(el, setMenuHeight);
  }

  const handleDropdownClick = (dropdownOptions) => {
    console.log("handleDropdownClick", dropdownOptions)
    if (dropdownOptions.goToMenu) {
      setActiveMenu(dropdownOptions.goToMenu);
      return;
    }
    doActionList(dropdownOptions.action);
    setActiveMenu("main");
    dispatch(setDropdownMenuObj(null));
    setMenuHeight(null);
  }

  if (dropdownMenuObj.type === "card") {
    return (
      <DropdownMenuCard
        mouseX={mouseX}
        mouseY={mouseY}
        menuHeight={menuHeight}
        handleDropdownClick={handleDropdownClick}
        calcHeight={calcHeight}
        activeMenu={activeMenu}
      />
    )
  } else if (dropdownMenuObj.type === "group") {
    return (
      <DropdownMenuGroup
        mouseX={mouseX}
        mouseY={mouseY}
        menuHeight={menuHeight}
        handleDropdownClick={handleDropdownClick}
        calcHeight={calcHeight}
        activeMenu={activeMenu}
      />
    )
  } else if (dropdownMenuObj.type === "firstPlayer") {
    return (
      <DropdownMenuFirstPlayer
        mouseX={mouseX}
        mouseY={mouseY}
        menuHeight={menuHeight}
        handleDropdownClick={handleDropdownClick}
        calcHeight={calcHeight}
        activeMenu={activeMenu}
      />
    )
  } else return null;

})