import React, { useContext, useState } from "react";
import { useDropdownClickCommon } from "../plugins/lotrlcg/functions/dropdownMenuClick";
import { DropdownMenuCard } from "../plugins/lotrlcg/components/DropdownMenuCard";
import { DropdownMenuGroup } from "../plugins/lotrlcg/components/DropdownMenuGroup";
import { DropdownMenuFirstPlayer } from "./DropdownMenuFirstPlayer";
import { useDispatch, useSelector } from 'react-redux';
import { calcHeightCommon } from "./DropdownMenuHelpers";
import "../../css/custom-dropdown.css";
import { setDropdownMenuObj } from "../store/playerUiSlice";
import store from "../../store";
import BroadcastContext from "../../contexts/BroadcastContext";

export const DropdownMenuCommon = React.memo(({
  mouseX,
  mouseY,
}) => {
  
  const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
  const dispatch = useDispatch();
  const dropdownMenuObj = useSelector(state => state?.playerUi?.dropdownMenuObj)
  const [activeMenu, setActiveMenu] = useState('main');
  const [menuHeight, setMenuHeight] = useState(null);
  const dropdownClickCommon = useDropdownClickCommon;

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
    dropdownClickCommon(dropdownOptions, actionProps);
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