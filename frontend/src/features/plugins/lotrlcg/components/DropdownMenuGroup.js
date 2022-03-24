import React from "react";
import { faArrowUp, faArrowDown, faRandom, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DropdownItem, GoBack } from "../../../engine/DropdownMenuHelpers";
import "../../../../css/custom-dropdown.css";
import { useSelector } from "react-redux";
import { useGameL10n } from "../../../../hooks/useGameL10n";

export const DropdownMenuGroup = React.memo(({
  mouseX,
  mouseY,
  menuHeight,
  handleDropdownClick,
  calcHeight,
  activeMenu,
}) => {
  const l10n = useGameL10n();
  const dropdownMenuObj = useSelector(state => state?.playerUi?.dropdownMenuObj)
  const playerN = useSelector(state => state?.playerUi?.playerN)
  const menuGroup = dropdownMenuObj.group;
  
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
          {l10n("Top")}
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faRandom}/>}
          action="moveStacks"
          destGroupId={props.destGroupId}
          position="shuffle"
          clickCallback={handleDropdownClick}>
          {l10n("Shuffle in")}
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faArrowDown}/>}
          action="moveStacks"
          destGroupId={props.destGroupId}
          position="bottom"
          clickCallback={handleDropdownClick}>
          {l10n("Bottom")}
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
        <div className="menu-title">{dropdownMenuObj.title}</div>

        {activeMenu === "main" &&
        <div className="menu">
          <DropdownItem action="shuffle" clickCallback={handleDropdownClick}>{l10n("Shuffle")}</DropdownItem>
          {menuGroup.id === "sharedEncounterDiscard" ? <DropdownItem action="moveStacks" destGroupId={"sharedEncounterDeck"} position="shuffle" clickCallback={handleDropdownClick}>{l10n("Shuffle into deck")}</DropdownItem> : null}
          {menuGroup.id === "sharedEncounterDeck" ? <DropdownItem action="discardUntil" cardType={"Enemy"} clickCallback={handleDropdownClick}>{l10n("Discard until Enemy")}</DropdownItem> : null}
          {menuGroup.id === "sharedEncounterDeck" ? <DropdownItem action="discardUntil" cardType={"Location"} clickCallback={handleDropdownClick}>{l10n("Discard until Location")}</DropdownItem> : null}
          {menuGroup.id === playerN+"Hand" ? <DropdownItem action="makeVisible" clickCallback={handleDropdownClick}>{l10n("Make visible/hidden")}</DropdownItem> : null}
          <DropdownItem action="lookAt" topN="None" clickCallback={handleDropdownClick}>{l10n("Browse")}</DropdownItem>
          <DropdownItem action="lookAt" topN="5" clickCallback={handleDropdownClick}>{l10n("Look at top 5")}</DropdownItem>
          <DropdownItem action="lookAt" topN="10" clickCallback={handleDropdownClick}>{l10n("Look at top 10")}</DropdownItem>
          <DropdownItem action="lookAt" topN="X" clickCallback={handleDropdownClick}>{l10n("Look at top X")}</DropdownItem>
          <DropdownItem action="chooseRandom" clickCallback={handleDropdownClick}>{l10n("Choose Random")}</DropdownItem>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveTo"
            clickCallback={handleDropdownClick}>
            {l10n("Move to")}
          </DropdownItem>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="more"
            clickCallback={handleDropdownClick}>
            {l10n("More")}
          </DropdownItem>
        </div>}

        {activeMenu === "moveTo" &&
        <div className="menu">
          <GoBack goToMenu="main" clickCallback={handleDropdownClick}/>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveToMy"
            clickCallback={handleDropdownClick}>
            {l10n("My Deck")}
          </DropdownItem>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveToEncounter1"
            clickCallback={handleDropdownClick}>
            {l10n("Encounter Deck")}
          </DropdownItem>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveToEncounter2"
            clickCallback={handleDropdownClick}>
            {l10n("Encounter Deck 2")}
          </DropdownItem>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveToEncounter3"
            clickCallback={handleDropdownClick}>
            {l10n("Encounter Deck 3")}
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
          <DropdownItem action="dealX" side="B" clickCallback={handleDropdownClick}>{l10n("Deal top X facedown")}</DropdownItem>
        </div>}
    </div>
  );
})