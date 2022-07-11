import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import useFocus from "../../hooks/useFocus";
import { useDoActionList } from "./functions/useDoActionList";
import { setTyping } from "../store/playerUiSlice";

var delayBroadcast;

export const TopBarUserCounter = React.memo(({
  playerI,
  playerProperty,
  imageUrl,
  name,
}) => {
  const dispatch = useDispatch();
  const doActionList = useDoActionList();
  const [value, setValue] = useState(useSelector(state => state?.gameUi?.game?.playerData?.[playerI]?.[playerProperty]) || 0);
  const [previousValue, setPreviousValue] = useState(value);
  const playerN = useSelector(state => state?.playerUi?.playerN);  
  const [inputRef, setInputFocus] = useFocus();
  const playerIAlias = useSelector(state => state?.gameUi?.playerInfo?.[playerI]?.alias);

  const handleValueChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    // Set up a delayed broadcast to update the game state that interrupts itself if the button is clicked again shortly after.
    if (delayBroadcast) clearTimeout(delayBroadcast);
    delayBroadcast = setTimeout(function() {
      const totalDelta = newValue - previousValue;
      setPreviousValue(newValue);
      const listOfActions = [
          {
              "_ACTION": "SET_VALUE",
              "_PATH": ["_GAME", "playerData", playerI, playerProperty],
              "_VALUE": newValue,
              "_MESSAGES": [["{playerN} set ", playerIAlias,"'s ", name, " to ",newValue," (change: ",totalDelta,")."]]
          }
      ]
      doActionList("_custom", listOfActions);
      setInputFocus();
    }, 400);
  }

  return(
    <div className="h-full w-full flex justify-center">
      <img className="h-full w-full object-contain ml-1" src={imageUrl}></img>
      <input 
        className="h-full w-1/2 float-left text-center bg-transparent" 
        value={value}
        onChange={handleValueChange}
        type="number" min="0" step="1"
        disabled={playerN ? false : true}
        onFocus={event => dispatch(setTyping(true))}
        onBlur={event => dispatch(setTyping(false))}
        ref={inputRef}>
      </input>
    </div>
  )
})