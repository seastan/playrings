import React, { useState } from "react";
import { faArrowUp, faArrowDown, faRandom, faReply, faChevronRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "../../css/custom-dropdown.css";

export const calcHeightCommon = (el, setMenuHeight) => {
  const height = el.clientHeight+50;
  setMenuHeight(height);
}

export const GoBack = (props) => {
  return (
    <DropdownItem goToMenu={props.goToMenu} leftIcon={<FontAwesomeIcon icon={faReply}/>} clickCallback={props.clickCallback}>
      Go back
    </DropdownItem>
  )
}

export const DropdownItem = (props) => {
  const handleDropDownItemClick = (event) => {
    event.stopPropagation();
    props.clickCallback(props);
  }

  return (
    <a href="#" className="menu-item" 
      //onTouchStart={(event) => handleDropDownItemClick(event)} onMouseUp={(event) => handleDropDownItemClick(event)}
      onClick={(event) => handleDropDownItemClick(event)}>    
      {props.leftIcon && <span className="icon-button">{props.leftIcon}</span>}
      {props.children}
      <span className="icon-right">{props.rightIcon}</span>
    </a>
  );
}
