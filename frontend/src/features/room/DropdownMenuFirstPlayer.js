import React from "react";
import { useSelector } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import { DropdownItem } from "./DropdownMenuHelpers";
import "../../css/custom-dropdown.css";

export const DropdownMenuFirstPlayer = React.memo(({
  mouseX,
  mouseY,
  menuHeight,
  handleDropdownClick,
  calcHeight,
  activeMenu,
}) => {
  const numPlayers = useSelector(state => state.gameUi.game.numPlayers);  
  const dropdownMenuObj = useSelector(state => state?.roomUi?.dropdownMenuObj)

  const left = mouseX < (window.innerWidth/2) ? mouseX : mouseX -300;
  const top = mouseY < (window.innerHeight/2) ? mouseY : mouseY -250;

  return (
    <div 
      className="dropdown" 
      style={{ height: menuHeight, zIndex: 1e7, top: top, left: left }}
      >
      <div className="menu-title">{dropdownMenuObj.title}</div>

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