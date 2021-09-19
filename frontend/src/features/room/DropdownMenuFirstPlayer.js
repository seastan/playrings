import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import { tokenTitleName, getVisibleSide } from "./Helpers";
import { faArrowUp, faArrowDown, faRandom, faChevronRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DropdownItem, GoBack } from "./DropdownMenuHelpers";
import "../../css/custom-dropdown.css";

export const DropdownMenuFirstPlayer = React.memo(({
  playerN,
  mouseX,
  mouseY,
  menuHeight,
  dropdownMenu,
  handleDropdownClick,
  calcHeight,
  activeMenu,
  setIsHovering,
}) => {
  const numPlayersStore = state => state.gameUi.game.numPlayers;
  const numPlayers = useSelector(numPlayersStore);
 
  const left = mouseX < (window.innerWidth/2) ? mouseX : mouseX -300;
  const top = mouseY < (window.innerHeight/2) ? mouseY : mouseY -250;

  return (
    <div 
      className="dropdown" 
      style={{ height: menuHeight, zIndex: 1e7, top: top, left: left }}
      >
      <div className="menu-title">{dropdownMenu.title}</div>

      <CSSTransition onEnter={calcHeight} timeout={500} classNames="menu-primary" unmountOnExit
        in={activeMenu === "main"}>
        <div className="menu">
          {Array.from(Array(numPlayers), (e, i) => {
            const title = "Player " + (i + 1);
            return <DropdownItem action={"player" + (i + 1)} title={title} clickCallback={handleDropdownClick}>{title}</DropdownItem>
          })}
        </div>
      </CSSTransition>
      
    </div>
  );
})