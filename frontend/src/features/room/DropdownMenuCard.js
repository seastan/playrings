import React from "react";
import { CSSTransition } from 'react-transition-group';
import { tokenTitleName, getVisibleSide, getVisibleFace } from "./Helpers";
import { faArrowUp, faArrowDown, faRandom, faChevronRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DropdownItem, GoBack } from "./DropdownMenuHelpers";
import "../../css/custom-dropdown.css";
import { PHASEINFO } from "./Constants";

export const DropdownMenuCard = React.memo(({
  playerN,
  mouseX,
  mouseY,
  menuHeight,
  dropdownMenu,
  handleDropdownClick,
  calcHeight,
  activeMenu,
}) => {
  const menuCard = dropdownMenu.card;
  const menuCardIndex = dropdownMenu.cardIndex;
  const visibleSide = getVisibleSide(menuCard);
  const visibleFace = getVisibleFace(menuCard);
  
  const DropdownMoveTo = (props) => {
    return (
      <div className="menu">
        <GoBack goToMenu="moveTo" clickCallback={handleDropdownClick}/>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faArrowUp}/>}
          action="moveCard"
          destGroupId={props.destGroupId}
          position="top"
          clickCallback={handleDropdownClick}>
          Top
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faRandom}/>}
          action="moveCard"
          destGroupId={props.destGroupId}
          position="shuffle"
          clickCallback={handleDropdownClick}>
          Shuffle in
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faRandom}/>}
          action="moveCard"
          destGroupId={props.destGroupId}
          position="shuffle_into_top"
          clickCallback={handleDropdownClick}>
          Shuffle into top X
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faRandom}/>}
          action="moveCard"
          destGroupId={props.destGroupId}
          position="shuffle_into_bottom"
          clickCallback={handleDropdownClick}>
          Shuffle into bottom X
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faArrowDown}/>}
          action="moveCard"
          destGroupId={props.destGroupId}
          position="bottom"
          clickCallback={handleDropdownClick}>
          Bottom
        </DropdownItem>
      </div>
    )
  }

  const left = mouseX < (window.innerWidth/2)  ? mouseX + 10 : mouseX -310;
  const top = mouseY < (window.innerHeight/2) ? mouseY : mouseY -150;

  return (
    <div 
      className="dropdown" 
      style={{ height: menuHeight, zIndex: 1e7, top: top, left: left }}>
        <div className="menu-title">{dropdownMenu.title}</div>

        {activeMenu === "main" &&
        <div className="menu">
          {menuCardIndex>0 ? <DropdownItem action="detach" clickCallback={handleDropdownClick}>Detach</DropdownItem> : null}
          <DropdownItem action="flip" clickCallback={handleDropdownClick}>Flip</DropdownItem>
          {(menuCard?.exhausted && dropdownMenu?.groupType === "play") ? <DropdownItem action="toggle_exhaust" clickCallback={handleDropdownClick}>Ready</DropdownItem> : null}
          {(!menuCard?.exhausted && dropdownMenu?.groupType === "play") ? <DropdownItem action="toggle_exhaust" clickCallback={handleDropdownClick}>Exhaust</DropdownItem> : null}
          {(visibleSide === "B" && !menuCard?.peeking[playerN]) ? <DropdownItem action="peek" clickCallback={handleDropdownClick}>Peek</DropdownItem> : null}
          {menuCard?.peeking[playerN] ? <DropdownItem action="unpeek" clickCallback={handleDropdownClick}>Stop peeking</DropdownItem> : null}
          {dropdownMenu?.groupId === playerN+"Hand" ? <DropdownItem action="swapWithTop" clickCallback={handleDropdownClick}>Swap with top</DropdownItem> : null}
          {(menuCard?.controller === playerN && dropdownMenu?.groupType === "play" && !menuCard?.locked) ? <DropdownItem action="lock" clickCallback={handleDropdownClick}>Prevent refresh</DropdownItem> : null}
          {(menuCard?.controller === playerN && dropdownMenu?.groupType === "play" && menuCard?.locked) ? <DropdownItem action="unlock" clickCallback={handleDropdownClick}>Enable refresh</DropdownItem> : null}
          <DropdownItem action="delete" clickCallback={handleDropdownClick}>Delete</DropdownItem>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveTo"
            clickCallback={handleDropdownClick}>
            Move to
          </DropdownItem>
          {dropdownMenu.groupType === "play" && 
            <DropdownItem
              rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
              goToMenu="perRound"
              clickCallback={handleDropdownClick}>
              Per round
            </DropdownItem>}
          {dropdownMenu.groupType === "play" && 
            <DropdownItem
              rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
              goToMenu="toggleTrigger"
              clickCallback={handleDropdownClick}>
              Toggle triggers
            </DropdownItem>}
          {dropdownMenu.groupType === "play" && menuCard.cardDbId === "ce1cf93c-68d9-4613-af3a-a08671152358" &&
            <DropdownItem
              rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
              goToMenu="setRotation"
              clickCallback={handleDropdownClick}>
              Set rotation
            </DropdownItem>}
        </div>}
        
        {activeMenu === "moveTo" &&
        <div className="menu">
          <GoBack goToMenu="main" clickCallback={handleDropdownClick}/>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveToEncounter"
            clickCallback={handleDropdownClick}>
            Encounter Deck
          </DropdownItem>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveToOwner"
            clickCallback={handleDropdownClick}>
            Owner's Deck
          </DropdownItem>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveToQuestDeck"
            clickCallback={handleDropdownClick}>
            Quest Deck
          </DropdownItem>
          <DropdownItem
            action="moveCard"
            destGroupId="sharedVictory"
            position="top"
            clickCallback={handleDropdownClick}>
            Victory Display
          </DropdownItem>
          <DropdownItem
            action="moveCard"
            destGroupId="sharedSetAside"
            position="top"
            clickCallback={handleDropdownClick}>
            Set Aside
          </DropdownItem>
        </div>}

        {activeMenu === "moveToEncounter" &&
        <DropdownMoveTo destGroupId="sharedEncounterDeck"/>}

        {activeMenu === "moveToOwner" &&
        <DropdownMoveTo destGroupId={playerN+"Deck"}/>}

        {activeMenu === "moveToQuestDeck" &&
        <DropdownMoveTo destGroupId={"sharedQuestDeck"}/>}

        {activeMenu === "perRound" &&
        <div className="menu">
          <GoBack goToMenu="main" clickCallback={handleDropdownClick}/>
          {["resource", "progress", "damage"].map((tokenType, _tokenIndex) => (
            <DropdownItem
              rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
              goToMenu={tokenType+"PerRound"}
              tokenType={tokenType}
              clickCallback={handleDropdownClick}>
              {tokenTitleName(tokenType)}
            </DropdownItem>
          ))}
        </div>}

      {["resource", "progress", "damage"].map((tokenType, _tokenIndex) => {
        const visible = activeMenu === tokenType+"PerRound";
        if (visible) return(
          <div className="menu">
            <GoBack goToMenu="perRound" clickCallback={handleDropdownClick}/>
            {[-3,-2,-1,0,1,2,3,4,5].map((increment, _tokenIndex) => (
              <DropdownItem
                rightIcon={(menuCard.tokensPerRound[tokenType]===increment ||
                  (!menuCard.tokensPerRound[tokenType] && increment===0)) ? <FontAwesomeIcon icon={faCheck}/> : null}
                action={"incrementTokenPerRound"}
                tokenType={tokenType}
                increment={increment}
                clickCallback={handleDropdownClick}>
                {increment}
              </DropdownItem>
            ))}
          </div>)
        })}

        {activeMenu === "toggleTrigger" &&
        <div className="menu">
          <GoBack goToMenu="main" clickCallback={handleDropdownClick}/>
          {PHASEINFO.map((phase, _phaseIndex) => (
            <DropdownItem
              rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
              goToMenu={phase.name+"ToggleTrigger"}
              clickCallback={handleDropdownClick}>
              {phase.name}
            </DropdownItem>
          ))}
        </div>}

      {PHASEINFO.map((phase, _phaseIndex) => {
        const visible = activeMenu === phase.name+"ToggleTrigger"
        if (visible) return(
        // <CSSTransition onEnter={calcHeight} timeout={500} classNames="menu-primary" unmountOnExit
        // in={activeMenu === phase.name+"ToggleTrigger"}>
          <div className="menu">
            <GoBack goToMenu="toggleTrigger" clickCallback={handleDropdownClick}/>
            {phase.steps.map((step, _stepIndex) => (
              <DropdownItem
                rightIcon={visibleFace.triggers.includes(step.id) ? <FontAwesomeIcon icon={faCheck}/> : null}
                action={"toggleTrigger"}
                stepId={step.id}
                clickCallback={handleDropdownClick}>
                <div className="text-xs">{step.text}</div>
              </DropdownItem>
            ))}
          </div>)
      })}


      {activeMenu === "setRotation" &&
        <div className="menu">
          <GoBack goToMenu="main" clickCallback={handleDropdownClick}/>
          {[0, 90, 180, 270].map((rot, _rotIndex) => (
            <DropdownItem
              rightIcon={menuCard.rotation===rot ? <FontAwesomeIcon icon={faCheck}/> : null}
              action={"setRotation"}
              rotation={rot}
              clickCallback={handleDropdownClick}>
              {rot}
            </DropdownItem>
          ))}
        </div>}

    </div>
  );
})