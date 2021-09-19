import React from "react";
import { CSSTransition } from 'react-transition-group';
import { faArrowUp, faArrowDown, faRandom, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DropdownItem, GoBack } from "./DropdownMenuHelpers";
import "../../css/custom-dropdown.css";

export const DropdownMenuGroup = React.memo(({
  playerN,
  mouseX,
  mouseY,
  menuHeight,
  dropdownMenu,
  handleDropdownClick,
  calcHeight,
  activeMenu,
}) => {
  const menuGroup = dropdownMenu.group;
  
  const DropdownMoveTo = (props) => {
    return (
      <div className="menu">
        <GoBack goToMenu="moveTo" clickCallback={handleDropdownClick}/>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faArrowUp}/>}
          action="moveStacks"
          destGroupId={props.destGroupId}
          position="top"
          clickCallback={handleDropdownClick}>
          Top
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faRandom}/>}
          action="moveStacks"
          destGroupId={props.destGroupId}
          position="shuffle"
          clickCallback={handleDropdownClick}>
          Shuffle in
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faArrowDown}/>}
          action="moveStacks"
          destGroupId={props.destGroupId}
          position="bottom"
          clickCallback={handleDropdownClick}>
          Bottom
        </DropdownItem>
      </div>
    )
  }

  const left = mouseX < (window.innerWidth/2)  ? mouseX : mouseX -300;
  const top = mouseY < (window.innerHeight/2) ? mouseY : mouseY -300;

  return (
    <div 
      className="dropdown" 
      style={{ height: menuHeight, zIndex: 1e7, top: top, left: left }}
      >
        <div className="menu-title">{dropdownMenu.title}</div>

        {activeMenu === "main" &&
        <div className="menu">
          <DropdownItem action="shuffle" clickCallback={handleDropdownClick}>Shuffle</DropdownItem>
          {menuGroup.id === playerN+"Hand" ? <DropdownItem action="makeVisible" clickCallback={handleDropdownClick}>Make visible/hidden</DropdownItem> : null}
          <DropdownItem action="lookAt" topN="None" clickCallback={handleDropdownClick}>Browse</DropdownItem>
          <DropdownItem action="lookAt" topN="5" clickCallback={handleDropdownClick}>Look at top 5</DropdownItem>
          <DropdownItem action="lookAt" topN="10" clickCallback={handleDropdownClick}>Look at top 10</DropdownItem>
          <DropdownItem action="lookAt" topN="X" clickCallback={handleDropdownClick}>Look at top X</DropdownItem>
          <DropdownItem action="chooseRandom" clickCallback={handleDropdownClick}>Choose Random</DropdownItem>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveTo"
            clickCallback={handleDropdownClick}>
            Move to
          </DropdownItem>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="more"
            clickCallback={handleDropdownClick}>
            More
          </DropdownItem>
        </div>}

        {activeMenu === "moveTo" &&
        <div className="menu">
          <GoBack goToMenu="main" clickCallback={handleDropdownClick}/>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveToMy"
            clickCallback={handleDropdownClick}>
            My Deck
          </DropdownItem>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveToEncounter1"
            clickCallback={handleDropdownClick}>
            Encounter Deck
          </DropdownItem>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveToEncounter2"
            clickCallback={handleDropdownClick}>
            Encounter Deck 2
          </DropdownItem>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveToEncounter3"
            clickCallback={handleDropdownClick}>
            Encounter Deck 3
          </DropdownItem>
        </div>}
        {activeMenu === "moveToMy" &&
        <DropdownMoveTo destGroupId={playerN+"Deck"}/>}
        {activeMenu === "moveToEncounter1" &&
        <DropdownMoveTo destGroupId="sharedEncounterDeck"/>}
        {activeMenu === "moveToEncounter2" &&
        <DropdownMoveTo destGroupId="sharedEncounterDeck2"/>}
        {activeMenu === "moveToEncounter3" &&
        <DropdownMoveTo destGroupId="sharedEncounterDeck3"/>}
        {activeMenu === "more" &&
        <div className="menu">
          <GoBack goToMenu="main" clickCallback={handleDropdownClick}/>
          <DropdownItem action="dealX" side="B" clickCallback={handleDropdownClick}>Deal top X facedown</DropdownItem>
        </div>}
    </div>
  );
})