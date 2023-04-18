import React, { useEffect, useState } from "react";
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
  const backEndValue = useSelector(state => state?.gameUi?.game?.playerData?.[playerI]?.[playerProperty]);
  const [value, setValue] = useState( backEndValue || 0);
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
        ["GAME_INCREASE_VAL", "/playerData/$PLAYER_N/" + playerProperty, totalDelta],
        ["GAME_ADD_MESSAGE", "$PLAYER_N", totalDelta >= 0 ? " increased " : " decreased ", name, " by ", Math.abs(totalDelta), "."]
      ]
      doActionList(listOfActions);
      setInputFocus();
    }, 400);
  }

  useEffect(() => {
    setValue(backEndValue);
    setPreviousValue(backEndValue);
  },[backEndValue]);

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