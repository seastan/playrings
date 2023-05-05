import React from "react";
import { faArrowUp, faArrowDown, faRandom, faChevronRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DropdownItem, GoBack } from "./DropdownMenuHelpers";
import "../../css/custom-dropdown.css";
import { useSelector } from "react-redux";
import { useGameDefinition } from "./functions/useGameDefinition";
import { useEvaluateCondition } from "../../hooks/useEvaluateCondition";
import { dragnActionLists, getVisibleFace, getVisibleSide } from "../definitions/common";
import { useSiteL10n } from "../../hooks/useSiteL10n";
import { useGameL10n } from "../../hooks/useGameL10n";

export const DropdownMenuCard = React.memo(({
  mouseX,
  mouseY,
  menuHeight,
  handleDropdownClick,
  calcHeight,
  activeMenu,
}) => {    
  const l10n = useSiteL10n();
  const gameL10n = useGameL10n();
  const gameDef = useGameDefinition();
  const playerN = useSelector(state => state?.playerUi?.playerN);
  const dropdownMenu = useSelector(state => state?.playerUi?.dropdownMenu);
  const menuCardId = dropdownMenu.cardId;
  const menuCard = useSelector(state => state?.gameUi?.game?.cardById?.[menuCardId]);
  const menuCardIndex = dropdownMenu.cardIndex;
  const visibleSide = getVisibleSide(menuCard);
  const visibleFace = getVisibleFace(menuCard);
  const evaluateCondition = useEvaluateCondition();
  
  const DropdownMoveTo = (destGroupId, handleDropdownClick) => {
    const label = gameL10n(gameDef?.groups?.[destGroupId]?.labelId);
    return (
      <div className="menu">
        <GoBack goToMenu="moveTo" clickCallback={handleDropdownClick}/>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faArrowUp}/>}
          action={dragnActionLists.moveCardToTop(menuCardId, destGroupId, label)}
          clickCallback={handleDropdownClick}>
          {l10n("top")}
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faRandom}/>}
          action={dragnActionLists.moveCardToShuffled(menuCardId, destGroupId, label)}
          clickCallback={handleDropdownClick}>
          {l10n("shuffleIn")}
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faRandom}/>}
          action={dragnActionLists.moveCardToTopX(menuCardId, destGroupId, label)}
          clickCallback={handleDropdownClick}>
          {l10n("shuffleIntoTopX")}
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faRandom}/>}
          action={dragnActionLists.moveCardToBottomX(menuCard, destGroupId, label)}
          clickCallback={handleDropdownClick}>
          {l10n("shuffleIntoBottomX")}
        </DropdownItem>
        <DropdownItem
          leftIcon={<FontAwesomeIcon icon={faArrowDown}/>}
          action={dragnActionLists.moveCardToBottom(menuCardId, destGroupId, label)}
          clickCallback={handleDropdownClick}>
          {l10n("bottom")}
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
                {l10n("detach")}
            </DropdownItem> : null}
          <DropdownItem 
            action= {dragnActionLists.flipCard(menuCard)} 
            clickCallback={handleDropdownClick}>
              {l10n("flip")}
          </DropdownItem>
          <DropdownItem 
            action= {dragnActionLists.deleteCard(menuCard)} 
            clickCallback={handleDropdownClick}>
              {l10n("delete")}
          </DropdownItem>
          {(visibleSide === "B" && !menuCard?.peeking[playerN]) ? <DropdownItem action="peek" clickCallback={handleDropdownClick}>{l10n("Peek")}</DropdownItem> : null}
          {gameDef?.cardMenu?.options?.map((menuItem, _itemIndex) => {
            if (menuItem?.showIf && !evaluateCondition(menuItem.showIf)) return;
            return ( 
              <DropdownItem 
                action={menuItem.actionList} 
                clickCallback={handleDropdownClick}>
                  {gameL10n(menuItem.labelId)}
              </DropdownItem> 
            )
          })}
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu="moveTo"
            clickCallback={handleDropdownClick}>
            {l10n("moveTo")}
          </DropdownItem>
          {menuCard?.inPlay && 
            <DropdownItem
              rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
              goToMenu="toggleTrigger"
              clickCallback={handleDropdownClick}>
              {l10n("toggleTriggers")}
            </DropdownItem>}
          {menuCard?.inPlay &&
            <DropdownItem
              rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
              goToMenu="setRotation"
              clickCallback={handleDropdownClick}>
              {l10n("setRotation")}
            </DropdownItem>}
        </div>}
        
        {activeMenu === "moveTo" &&
        <div className="menu">
          <GoBack goToMenu="main" clickCallback={handleDropdownClick}/>
          <DropdownItem
            rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
            goToMenu={"moveTo"+menuCard?.deckGroupId}
            clickCallback={handleDropdownClick}>
            {l10n("deckOfOrigin")}
          </DropdownItem>
          {gameDef?.cardMenu?.moveToGroupIds.map((groupId, index) => {
            return (
              <DropdownItem
                key={index}
                rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
                goToMenu={"moveTo"+groupId}
                clickCallback={handleDropdownClick}>
                {gameL10n(gameDef?.groups?.[groupId]?.labelId)}
              </DropdownItem>
            )
          })}
        </div>}

        {activeMenu === "moveTo"+menuCard?.deckGroupId &&
          DropdownMoveTo(menuCard?.deckGroupId,handleDropdownClick)
        }

        {/* {gameDef?.cardMenu?.moveToGroupIds?.map((groupId, index) => {
          if (activeMenu === "moveTo"+groupId) return(
            <DropdownMoveTo key={index} destGroupId={groupId}/>
          )
        })} */}

        {activeMenu === "toggleTrigger" &&
        <div className="menu">
          <GoBack goToMenu="main" clickCallback={handleDropdownClick}/>
          {gameDef?.phases?.map((phaseInfo, _phaseIndex) => (
            <DropdownItem
              rightIcon={<FontAwesomeIcon icon={faChevronRight}/>}
              goToMenu={phaseInfo.phaseId+"ToggleTrigger"}
              clickCallback={handleDropdownClick}>
              {gameL10n(phaseInfo.labelId)}
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
                  <div className="text-xs">{gameL10n(stepInfo.labelId)}</div>
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