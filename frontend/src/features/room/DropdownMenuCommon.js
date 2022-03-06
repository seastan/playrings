import React, { useState } from "react";
import { handleDropdownClickCommon } from "./DropdownMenuClick";
import { DropdownMenuCard } from "./DropdownMenuCard";
import { DropdownMenuGroup } from "./DropdownMenuGroup";
import { DropdownMenuFirstPlayer } from "./DropdownMenuFirstPlayer";
import { useDispatch, useSelector } from 'react-redux';
import { calcHeightCommon, DropdownItem, GoBack } from "./DropdownMenuHelpers";
import "../../css/custom-dropdown.css";
import { setDropdownMenuObj } from "./playerUiSlice";
import store from "../../store";

export const DropdownMenuCommon = React.memo(({
  gameBroadcast,
  chatBroadcast,
  mouseX,
  mouseY,
}) => {
  
  const dispatch = useDispatch();
  const dropdownMenuObj = useSelector(state => state?.playerUi?.dropdownMenuObj)
  console.log("dropdownMenuObj",dropdownMenuObj)
  const [activeMenu, setActiveMenu] = useState('main');
  const [menuHeight, setMenuHeight] = useState(null);

  const calcHeight = (el) => {
    calcHeightCommon(el, setMenuHeight);
  }

  const handleDropdownClick = (dropdownOptions) => {
    if (dropdownOptions.goToMenu) {
      setActiveMenu(dropdownOptions.goToMenu);
      return;
    }
    const state = store.getState();
    const actionProps = {state, dispatch, gameBroadcast, chatBroadcast};
    handleDropdownClickCommon(dropdownOptions, actionProps);
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