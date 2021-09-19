import React, { useState } from "react";
import { CSSTransition } from 'react-transition-group';
import { GROUPSINFO } from "./Constants";
import { handleDropdownClickCommon } from "./DropdownMenuClick";
import { DropdownMenuCard } from "./DropdownMenuCard";
import { DropdownMenuGroup } from "./DropdownMenuGroup";
import { DropdownMenuFirstPlayer } from "./DropdownMenuFirstPlayer";
import { getDisplayName, tokenTitleName, getVisibleSide } from "./Helpers";
import { faArrowUp, faArrowDown, faRandom, faReply, faChevronRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from 'react-redux';
import { calcHeightCommon, DropdownItem, GoBack } from "./DropdownMenuHelpers";
import "../../css/custom-dropdown.css";
import { useSetKeypress } from "../../contexts/KeypressContext";
import { useActiveCard, useSetActiveCard } from "../../contexts/ActiveCardContext";

export const DropdownMenuCommon = React.memo(({
  playerN,
  gameBroadcast,
  chatBroadcast,
  mouseX,
  mouseY,
  dropdownMenu,
  setDropdownMenu,
}) => {
  
  const gameUiStore = state => state?.gameUi;
  const gameUi = useSelector(gameUiStore);

  const [activeMenu, setActiveMenu] = useState('main');
  const [menuHeight, setMenuHeight] = useState(null);

  const menuCard = dropdownMenu.card;
  const menuCardIndex = dropdownMenu.cardIndex;

  const visibleSide = getVisibleSide(menuCard);
  const displayName = getDisplayName(menuCard);

  const keypress = useSetKeypress();
  const setKeypress = useSetKeypress();

  const activeCardAndLoc = useActiveCard();
  const setActiveCardAndLoc = useSetActiveCard();

  const dispatch = useDispatch();

  const calcHeight = (el) => {
    calcHeightCommon(el, setMenuHeight);
  }

  const handleDropdownClick = (dropdownOptions) => {
    if (dropdownOptions.goToMenu) {
      setActiveMenu(dropdownOptions.goToMenu);
      return;
    }
    const dropdownProps = {dropdownOptions, dropdownMenu, gameUi, playerN, gameBroadcast, chatBroadcast, activeCardAndLoc, setActiveCardAndLoc, dispatch, keypress, setKeypress};
    handleDropdownClickCommon(dropdownProps);
    setActiveMenu("main");
    setDropdownMenu(null);
    setMenuHeight(null);
  }

  if (dropdownMenu.type === "card") {
    return (
      <DropdownMenuCard
        playerN={playerN}
        mouseX={mouseX}
        mouseY={mouseY}
        menuHeight={menuHeight}
        dropdownMenu={dropdownMenu}
        handleDropdownClick={handleDropdownClick}
        calcHeight={calcHeight}
        activeMenu={activeMenu}
      />
    )
  } else if (dropdownMenu.type === "group") {
    return (
      <DropdownMenuGroup
        playerN={playerN}
        mouseX={mouseX}
        mouseY={mouseY}
        menuHeight={menuHeight}
        dropdownMenu={dropdownMenu}
        handleDropdownClick={handleDropdownClick}
        calcHeight={calcHeight}
        activeMenu={activeMenu}
      />
    )
  } else if (dropdownMenu.type === "firstPlayer") {
    return (
      <DropdownMenuFirstPlayer
        playerN={playerN}
        mouseX={mouseX}
        mouseY={mouseY}
        menuHeight={menuHeight}
        dropdownMenu={dropdownMenu}
        handleDropdownClick={handleDropdownClick}
        calcHeight={calcHeight}
        activeMenu={activeMenu}
      />
    )
  } else return null;

})