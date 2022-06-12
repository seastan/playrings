import React from "react";
import { tokenTitleName, getVisibleSide, getVisibleFace } from "../plugins/lotrlcg/functions/helpers";
import { faArrowUp, faArrowDown, faRandom, faChevronRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DropdownItem, GoBack } from "./DropdownMenuHelpers";
import "../../css/custom-dropdown.css";
import { PHASEINFO } from "../plugins/lotrlcg/definitions/constants";
import { useSelector } from "react-redux";
import { useGameL10n } from "../../hooks/useGameL10n";
import { useGameDefinition } from "./functions/useGameDefinition";
import { useEvaluateCondition } from "../../hooks/useEvaluateCondition";

export const DropdownMenuCard = React.memo(({
  mouseX,
  mouseY,
  menuHeight,
  handleDropdownClick,
  calcHeight,
  activeMenu,
}) => {    
  const l10n = useGameL10n();
  const gameDef = useGameDefinition();
  const playerN = useSelector(state => state?.playerUi?.playerN);
  const dropdownMenuObj = useSelector(state => state?.playerUi?.dropdownMenuObj);
  const menuCardId = dropdownMenuObj.cardId;
  const menuCard = useSelector(state => state?.gameUi?.game?.cardById?.[menuCardId]);
  const menuCardIndex = dropdownMenuObj.cardIndex;
  const visibleSide = getVisibleSide(menuCard);
  const visibleFace = getVisibleFace(menuCard);
  const evaluateCondition = useEvaluateCondition();
  
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
          {l10n("Top")}
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faRandom}/>}
          action="moveCard"
          destGroupId={props.destGroupId}
          position="shuffle"
          clickCallback={handleDropdownClick}>
          {l10n("Shuffle in")}
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faRandom}/>}
          action="moveCard"
          destGroupId={props.destGroupId}
          position="shuffle_into_top"
          clickCallback={handleDropdownClick}>
          {l10n("Shuffle into top X")}
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faRandom}/>}
          action="moveCard"
          destGroupId={props.destGroupId}
          position="shuffle_into_bottom"
          clickCallback={handleDropdownClick}>
          {l10n("Shuffle into bottom X")}
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faArrowDown}/>}
          action="moveCard"
          destGroupId={props.destGroupId}
          position="bottom"
          clickCallback={handleDropdownClick}>
          {l10n("Bottom")}
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
        <div className="menu-title">{dropdownMenuObj.title}</div>

        {activeMenu === "main" &&
        <div className="menu">
          {menuCardIndex>0 ? <DropdownItem action="detach" clickCallback={handleDropdownClick}>{l10n("Detach")}</DropdownItem> : null}
          <DropdownItem action="flipCard" clickCallback={handleDropdownClick}>{l10n("Flip")}</DropdownItem>
          {menuCard?.inPlay ? <DropdownItem action="toggle_rotate" clickCallback={handleDropdownClick}>{l10n("Toggle 90° rotate")}</DropdownItem> : null}
          {(visibleSide === "B" && !menuCard?.peeking[playerN]) ? <DropdownItem action="peek" clickCallback={handleDropdownClick}>{l10n("Peek")}</DropdownItem> : null}
          {menuCard?.peeking[playerN] ? <DropdownItem action="unpeek" clickCallback={handleDropdownClick}>{l10n("Stop peeking")}</DropdownItem> : null}
          {menuCard?.groupId === playerN+"Hand" ? <DropdownItem action="swap_with_top" clickCallback={handleDropdownClick}>{l10n("Swap with top")}</DropdownItem> : null}
          {gameDef.cardMenu.map((menuItem, _itemIndex) => (
            evaluateCondition(menuItem.showIf) ? 
              <DropdownItem 
                action={menuItem.actionName} 
                clickCallback={handleDropdownClick}>
                  {l10n(menuItem.title)}
              </DropdownItem> 
              : null
          ))}
          <DropdownItem action="delete" clickCallback={handleDropdownClick}>{l10n("Delete")}</DropdownItem>
          {menuCardIndex>0 ? <DropdownItem action="swap_side" clickCallback={handleDropdownClick}>{l10n("Swap Side")}</DropdownItem> : null}

          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveTo"
            clickCallback={handleDropdownClick}>
            {l10n("Move to")}
          </DropdownItem>
          {menuCard?.inPlay && 
            <DropdownItem
              rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
              goToMenu="perRound"
              clickCallback={handleDropdownClick}>
              {l10n("Per round")}
            </DropdownItem>}
          {menuCard?.inPlay && 
            <DropdownItem
              rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
              goToMenu="toggleTrigger"
              clickCallback={handleDropdownClick}>
              {l10n("Toggle triggers")}
            </DropdownItem>}
          {menuCard?.inPlay &&
            <DropdownItem
              rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
              goToMenu="setRotation"
              clickCallback={handleDropdownClick}>
              {l10n("Set rotation")}
            </DropdownItem>}
        </div>}
        
        {activeMenu === "moveTo" &&
        <div className="menu">
          <GoBack goToMenu="main" clickCallback={handleDropdownClick}/>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveToEncounter"
            clickCallback={handleDropdownClick}>
            {l10n("Encounter Deck")}
          </DropdownItem>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveToOwner"
            clickCallback={handleDropdownClick}>
            {l10n("Owner's Deck")}
          </DropdownItem>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveToQuestDeck"
            clickCallback={handleDropdownClick}>
            {l10n("Quest Deck")}
          </DropdownItem>
          <DropdownItem
            action="moveCard"
            destGroupId="sharedVictory"
            position="top"
            clickCallback={handleDropdownClick}>
            {l10n("Victory Display")}
          </DropdownItem>
          <DropdownItem
            action="moveCard"
            destGroupId="sharedSetAside"
            position="top"
            clickCallback={handleDropdownClick}>
            {l10n("Set Aside")}
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
          {Object.keys(gameDef.tokens).map((tokenType, _tokenIndex) => (
            <DropdownItem
              rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
              goToMenu={tokenType+"PerRound"}
              tokenType={tokenType}
              clickCallback={handleDropdownClick}>
              {l10n(tokenType)}
            </DropdownItem>
          ))}
        </div>}

      {Object.keys(gameDef.tokens).map((tokenType, _tokenIndex) => {
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
              {l10n(phase.name)}
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