import React from "react";
import { faArrowUp, faArrowDown, faRandom, faChevronRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DropdownItem, GoBack } from "./DropdownMenuHelpers";
import "../../css/custom-dropdown.css";
import { PHASEINFO } from "../plugins/lotrlcg/definitions/constants";
import { useSelector } from "react-redux";
import { useGameL10n } from "../../hooks/useGameL10n";
import { useGameDefinition } from "./functions/useGameDefinition";
import { useEvaluateCondition } from "../../hooks/useEvaluateCondition";
import { dragnActionLists, getVisibleFace, getVisibleSide } from "../definitions/common";

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
  const dropdownMenu = useSelector(state => state?.playerUi?.dropdownMenu);
  const menuCardId = dropdownMenu.cardId;
  const menuCard = useSelector(state => state?.gameUi?.game?.cardById?.[menuCardId]);
  const menuCardIndex = dropdownMenu.cardIndex;
  const visibleSide = getVisibleSide(menuCard);
  const visibleFace = getVisibleFace(menuCard);
  const evaluateCondition = useEvaluateCondition();
  
  const DropdownMoveTo = (props) => {
    return (
      <div className="menu">
        <GoBack goToMenu="moveTo" clickCallback={handleDropdownClick}/>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faArrowUp}/>}
          action={dragnActionLists.moveCardToTop(menuCardId, props.destGroupId)}
          clickCallback={handleDropdownClick}>
          {l10n("Top")}
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faRandom}/>}
          action={dragnActionLists.moveCardToShuffled(menuCardId, props.destGroupId)}
          clickCallback={handleDropdownClick}>
          {l10n("Shuffle in")}
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faRandom}/>}
          action={dragnActionLists.moveCardToTopX(menuCardId, props.destGroupId)}
          clickCallback={handleDropdownClick}>
          {l10n("Shuffle into top X")}
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faRandom}/>}
          action={dragnActionLists.moveCardToBottomX(menuCard)}
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
        <div className="menu-title">{dropdownMenu.title}</div>

        {activeMenu === "main" &&
        <div className="menu">
          {menuCard.cardIndex>0 ? 
            <DropdownItem 
              action={dragnActionLists.detach(menuCard)} 
              clickCallback={handleDropdownClick}>
                {l10n("Detach")}
            </DropdownItem> : null}
          <DropdownItem 
            action= {dragnActionLists.flipCard(menuCard)} 
            clickCallback={handleDropdownClick}>
              {l10n("Flip")}
          </DropdownItem>
          {(visibleSide === "B" && !menuCard?.peeking[playerN]) ? <DropdownItem action="peek" clickCallback={handleDropdownClick}>{l10n("Peek")}</DropdownItem> : null}
          {gameDef?.cardMenu?.options?.map((menuItem, _itemIndex) => {
            if (menuItem?.showIf && !evaluateCondition(menuItem.showIf)) return;
            return ( 
              <DropdownItem 
                action={menuItem.actionList} 
                clickCallback={handleDropdownClick}>
                  {l10n(menuItem.labelId)}
              </DropdownItem> 
            )
          })}
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
            goToMenu={"moveTo"+menuCard?.deckGroupId}
            clickCallback={handleDropdownClick}>
            {l10n("Deck of origin")}
          </DropdownItem>
          {gameDef?.cardMenu?.moveToGroupIds.map((groupId, index) => {
            return (
              <DropdownItem
                key={index}
                rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
                goToMenu={"moveTo"+groupId}
                clickCallback={handleDropdownClick}>
                {l10n(gameDef?.groups?.[groupId]?.name)}
              </DropdownItem>
            )
          })}
        </div>}

        {activeMenu === "moveTo"+menuCard?.deckGroupId &&
        <DropdownMoveTo destGroupId={menuCard?.deckGroupId}/>}

        {gameDef?.cardMenu?.moveToGroupIds?.map((groupId, index) => {
          if (activeMenu === "moveTo"+groupId) return(
            <DropdownMoveTo key={index} destGroupId={groupId}/>
          )
        })}

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
          {gameDef?.phases?.map((phaseInfo, _phaseIndex) => (
            <DropdownItem
              rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
              goToMenu={phaseInfo.phaseId+"ToggleTrigger"}
              clickCallback={handleDropdownClick}>
              {l10n(phaseInfo.phaseId)}
            </DropdownItem>
          ))}
        </div>}

      {gameDef?.phases?.map((phaseInfo, _phaseIndex) => {
        const visible = activeMenu === phaseInfo.phaseId+"ToggleTrigger"
        if (visible) return(
          <div className="menu">
            <GoBack goToMenu="toggleTrigger" clickCallback={handleDropdownClick}/>
            {gameDef?.steps?.map((stepInfo, _stepIndex) => {
              if (stepInfo.phaseId === phaseInfo.phaseId) return(
                <DropdownItem
                  rightIcon={visibleFace?.triggers?.[stepInfo.stepId] ? <FontAwesomeIcon icon={faCheck}/> : null}
                  action={dragnActionLists.toggleTrigger(stepInfo.stepId)}
                  clickCallback={handleDropdownClick}>
                  <div className="text-xs">{stepInfo.text}</div>
                </DropdownItem>
              )})}
          </div>)
      })}


      {activeMenu === "setRotation" &&
        <div className="menu">
          <GoBack goToMenu="main" clickCallback={handleDropdownClick}/>
          {[0, 90, 180, 270].map((rot, _rotIndex) => (
            <DropdownItem
              rightIcon={menuCard.rotation===rot ? <FontAwesomeIcon icon={faCheck}/> : null}
              action={dragnActionLists.setRotation(rot)} // TODO: put actionId here that links to common actionid file
              clickCallback={handleDropdownClick}>
              {rot}
            </DropdownItem>
          ))}
        </div>}

    </div>
  );
})