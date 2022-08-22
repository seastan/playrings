import React from "react";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Draggable from 'react-draggable';
import { useDispatch, useSelector } from "react-redux";
import { setShowHotkeys } from "../../../store/playerUiSlice";
import { useGameL10n } from "../../../../hooks/useGameL10n";
import { useGameDefinition } from "../../../engine/functions/useGameDefinition";

const keyClass = "m-auto border bg-gray-500 text-center bottom inline-block";
const keyClassLong = "m-auto border bg-gray-500 text-center bottom inline-block";
const keyStyle = {width: "3vh", height: "3vh", borderRadius: "0.5vh"}
const keyStyleL = {width: "7vh", height: "3vh", borderRadius: "0.5vh"}
const keyStyleXL = {width: "12vh", height: "3vh", borderRadius: "0.5vh"}
const windowClass = "insert-auto overflow-auto bg-gray-700 border max-w-lg rounded-lg outline-none text-white";
const windowStyle = {
  position:"absolute", 
  zIndex: 2e4, 
  right: "30px", 
  top: "200px", 
  width:"500px", 
  height: "600px",
}
const windowClassL = "insert-auto overflow-auto bg-gray-700 border rounded-lg outline-none text-white";
const windowStyleL = {
  position:"absolute", 
  zIndex: 2e4, 
  left: "3vw", 
  top: "3vh", 
  width:"94vw", 
  height: "94vh",
}
const col1Class = "w-1/3";
const col2Class = "w-2/3";

export const HotkeyTable = React.memo(({hotkeyList}) => {
  const l10n = useGameL10n();
  if (hotkeyList) return(
    <table className="table-fixed rounded-lg w-full">
      <tr className="bg-gray-800">
          <th className={col1Class}>{l10n("Key")}</th>
          <th className={col2Class}>{l10n("Description")}</th>
      </tr>
      {hotkeyList.map((el, elIndex) => {
      const keys = el.key.split("+")
      return (
        <tr className={elIndex % 2 == 0 ? "bg-gray-500" : "bg-gray-600"}>
          <td className="p-1 text-center">
            {keys.map((key, _keyIndex) => {
              if (key.length > 6) return <div className={keyClass} style={keyStyleXL}>{key}</div>
              else if (key.length > 1) return <div className={keyClass} style={keyStyleL}>{key}</div>
              else return <div className={keyClass} style={keyStyle}>{key}</div>
            })}
          </td>
          <td className="text-center">{l10n(el.label)}</td>
        </tr>
      )
    })}
    </table>
  )
})

export const Hotkeys = React.memo(({}) => {
  const dispatch = useDispatch();
  const gameDef = useGameDefinition();
  const l10n = useGameL10n();
  const showWindow = useSelector(state => state?.playerUi?.showHotkeys);
  const tabPressed = useSelector(state => state?.playerUi?.keypress?.Tab);
  if (!showWindow && !tabPressed) return;

  const iconImg = (tokenType) => {
    return(<img className="m-auto h-6 inline-block" src={process.env.PUBLIC_URL + '/images/tokens/'+tokenType+'.png'}/>)
  }


  if (tabPressed) {
    return(
      <div className={windowClassL} style={windowStyleL}>
        <div className="w-full p-3 overflow-y-scroll">
          <div className="w-1/3 float-left p-3">
            <h2 className="mb-2">{l10n("Tokens")}</h2>
            {l10n("Hover over the top/bottom half of the card when pressing the key to add/remove tokens.")}
            <HotkeyTable hotkeyList={gameDef?.hotkeys?.token}/>
          </div>
          <div className="w-1/3 float-left p-3">
            <h2 className="mb-2">{l10n("Card hotkeys")}</h2>
            {l10n("Hover over a card.")}
            <HotkeyTable hotkeyList={gameDef?.hotkeys?.card}/>
          </div>
          <div className="w-1/3 float-left p-3">
            <h2 className="mb-2">{l10n("Game hotkeys")}</h2>
            <HotkeyTable hotkeyList={gameDef?.hotkeys?.game}/>
            </div>
        </div>
      </div>
    )
  }
  else {
    return(
      <Draggable>
        <div className={windowClass} style={windowStyle}>
          <div className="w-full bg-gray-500" style={{height: "25px"}}>
            <FontAwesomeIcon 
              className="ml-2" 
              icon={faTimes} 
              onMouseUp={() => dispatch(setShowHotkeys(false))} 
              onTouchStart={() => dispatch(setShowHotkeys(false))}/>
          </div>
          <div className="w-full p-3 overflow-y-scroll" style={{height: "523px"}}>
            <h2 className="mb-2">{l10n("Tokens")}</h2>
            {l10n("Hover over the top/bottom half of the card when pressing the key to add/remove tokens.")}
            <HotkeyTable hotkeyList={gameDef?.hotkeys?.token}/>
            <br />
            <h2 className="mb-2">{l10n("Card hotkeys")}</h2>
            {l10n("Hover over a card.")}
            <HotkeyTable hotkeyList={gameDef?.hotkeys?.card}/>
            <br />
            <h2 className="mb-2">{l10n("Game hotkeys")}</h2>
            <HotkeyTable hotkeyList={gameDef?.hotkeys?.game}/>
          </div>
        </div>
      </Draggable>
    )
  }
})
