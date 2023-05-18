import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGameDefinition } from "./hooks/useGameDefinition";
import { setMouseXY, setDropdownMenu, setTouchAction } from "../store/playerUiSlice";
import { useDoActionList } from "./hooks/useDoActionList";
import { useGameL10n } from "./hooks/useGameL10n";

export const TouchButton = React.memo(({buttonObj}) => {
  const dispatch = useDispatch();
  const touchAction = useSelector(state => state?.playerUi?.touchAction);
  const doActionList = useDoActionList();
  const l10n = useGameL10n();
  // Check if action is selected

  const selected = touchAction?.id === buttonObj?.id;
  var bgColor = selected ? " bg-green-700" : " bg-gray-600";
  if (selected && touchAction?.doubleClicked) bgColor = " bg-red-700"
  const hoverColor = selected ? "" : " hover:bg-gray-500";

  const handleClick = (event) => {
    event.stopPropagation();
    // When a touch button is pressed, remove any active card to dropdown menu
    dispatch(setDropdownMenu(null));
    dispatch(setMouseXY(null));
    // If it's a game function, just do it
    if (buttonObj?.actionType === "game") {
      doActionList(buttonObj?.actionListId)
    // If button is selected already, either change it from + to - or deselect it
    } else if (selected) {
      if (touchAction?.actionType === "token" && !touchAction.doubleClicked) {
        dispatch(setTouchAction(
          {...touchAction, doubleClicked: true}
        ))
      } else {
        dispatch(setTouchAction(null)); 
      }
    } 
    // Otherwise, select the button
    else dispatch(setTouchAction(buttonObj));
  }

  const img = buttonObj?.actionType === "token" ? 
      <div className={"absolute flex pointer-events-none h-full w-full top-0 items-center justify-center"}>
        <img className="" style={{opacity: selected ? "30%" : "100%", height: "4vh", width: "4vh"}} src={buttonObj.imageUrl}/>
      </div>
    : null

  var displayText = l10n(buttonObj.labelId);
  if (selected && touchAction?.actionType === "token" && !touchAction.doubleClicked) displayText = <span className="flex items-center" style={{fontSize: "42px", textShadow: "rgb(0, 0, 0) 2px 0px 0px, rgb(0, 0, 0) 1.75517px 0.958851px 0px, rgb(0, 0, 0) 1.0806px 1.68294px 0px, rgb(0, 0, 0) 0.141474px 1.99499px 0px, rgb(0, 0, 0) -0.832294px 1.81859px 0px, rgb(0, 0, 0) -1.60229px 1.19694px 0px, rgb(0, 0, 0) -1.97999px 0.28224px 0px, rgb(0, 0, 0) -1.87291px -0.701566px 0px, rgb(0, 0, 0) -1.30729px -1.51361px 0px, rgb(0, 0, 0) -0.421592px -1.95506px 0px, rgb(0, 0, 0) 0.567324px -1.91785px 0px, rgb(0, 0, 0) 1.41734px -1.41108px 0px, rgb(0, 0, 0) 1.92034px -0.558831px 0px"}}>+</span>;
  if (selected && touchAction?.actionType === "token" && touchAction.doubleClicked) displayText = <span className="flex items-center"  style={{fontSize: "42px", textShadow: "rgb(0, 0, 0) 2px 0px 0px, rgb(0, 0, 0) 1.75517px 0.958851px 0px, rgb(0, 0, 0) 1.0806px 1.68294px 0px, rgb(0, 0, 0) 0.141474px 1.99499px 0px, rgb(0, 0, 0) -0.832294px 1.81859px 0px, rgb(0, 0, 0) -1.60229px 1.19694px 0px, rgb(0, 0, 0) -1.97999px 0.28224px 0px, rgb(0, 0, 0) -1.87291px -0.701566px 0px, rgb(0, 0, 0) -1.30729px -1.51361px 0px, rgb(0, 0, 0) -0.421592px -1.95506px 0px, rgb(0, 0, 0) 0.567324px -1.91785px 0px, rgb(0, 0, 0) 1.41734px -1.41108px 0px, rgb(0, 0, 0) 1.92034px -0.558831px 0px"}}>−</span>;

  return (
    <div 
      //onMouseUp={(event) => handleClick(event)} onTouchStart={(event) => handleClick(event)} 
      onClick={(event) => handleClick(event)} 
      className={"absolute cursor-default h-full w-full p-0.5 top-0"}>
      <div className={"flex rounded-lg w-full h-full text-center items-center justify-center" + bgColor + hoverColor}>
        {displayText}
      </div>
      {img}
    </div>
  )
})


export const TouchBarBottom = React.memo(({}) => {
  const gameDef = useGameDefinition();
  const containerClass = "relative text-center";
  const containerStyle = {};
  
  return (
    <table className="table-fixed w-full h-full text-white select-none" style={{width: "99.9%"}}>
      <tbody className="w-full h-full">
        {gameDef.touchBar.map((row, rowIndex) => {
          return (
            <tr className={"bg-gray-700"} style={{height: `${100/gameDef.touchBar.length}%`}}>
              {row.map((buttonObj, _index) => {
                return (
                  <td className={containerClass} style={containerStyle}>
                    <TouchButton buttonObj={buttonObj}/>
                  </td>
                )
              })}
            </tr> 
          )
        })}
      </tbody>
    </table>
  )
})