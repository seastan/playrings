import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import UserName from "../user/UserName";
import useProfile from "../../hooks/useProfile";
import useFocus from "../../hooks/useFocus";
import useIsLoggedIn from "../../hooks/useIsLoggedIn";
import { Link } from "react-router-dom";
import { setValues } from "./gameUiSlice";
import { useSetDropdownMenu } from "../../contexts/DropdownMenuContext";
import { getCurrentFace } from "./Helpers";
import { useObservingPlayerN, useSetObservingPlayerN } from "../../contexts/ObservingPlayerNContext";

var delayBroadcast;

export const TopBarUser = React.memo(({
  playerN,
  playerI,
  gameBroadcast,
  chatBroadcast,
  setTyping,
}) => {
  console.log("Rendering TopBarUser ", playerI);
  const dispatch = useDispatch();
  const playerIdsStore = state => state?.gameUi?.playerIds;
  const playerIds = useSelector(playerIdsStore);
  const playerDataPlayerNStore = state => state?.gameUi?.game?.playerData?.[playerI];
  const playerDataPlayerN = useSelector(playerDataPlayerNStore);  
  const firstPlayerStore = state => state?.gameUi?.game?.firstPlayer;
  const firstPlayer = useSelector(firstPlayerStore);  
  const isLoggedIn = useIsLoggedIn();
  const myUser = useProfile();
  const myUserID = myUser?.id;  
  const gameUiThreat = playerDataPlayerN ? playerDataPlayerN["threat"] : 0;
  const [threatValue, setThreatValue] = useState(gameUiThreat);
  const gameUiWillpower = playerDataPlayerN ? playerDataPlayerN["willpower"] : 0;
  const [willpowerValue, setWillpowerValue] = useState(gameUiWillpower);
  const [inputRefThreat, setInputFocusThreat] = useFocus();
  const [inputRefWillpower, setInputFocusWillpower] = useFocus();
  const setDropdownMenu = useSetDropdownMenu();
  const observingPlayerN = useObservingPlayerN();
  const setObservingPlayerN = useSetObservingPlayerN();

  useEffect(() => {    
    if (gameUiThreat !== threatValue) setThreatValue(gameUiThreat);
  }, [gameUiThreat]);
  useEffect(() => {    
    if (gameUiWillpower !== willpowerValue) setWillpowerValue(gameUiWillpower);
  }, [gameUiWillpower]);

  if (!playerIds) return null;
  if (!playerDataPlayerN) return null;

  const sittingUserID = playerIds[playerI];

  const handleFirstPlayerClick = (event) => {
    event.stopPropagation();
    if (!playerN) return;
    const dropdownMenu = {
        type: "firstPlayer",
        title: "Set first player",
    }
    setDropdownMenu(dropdownMenu);
  }
  
  // If not observing anyone, observe yourself
  if (!observingPlayerN && (myUserID === sittingUserID)) setObservingPlayerN(playerI);

  const handleThreatChange = (event) => {
    const newValue = event.target.value;
    setThreatValue(newValue);
    const increment = newValue - gameUiThreat;
    // Set up a delayed broadcast to update the game state that interrupts itself if the button is clicked again shortly after.
    if (delayBroadcast) clearTimeout(delayBroadcast);
    delayBroadcast = setTimeout(function() {
      const updates = [["game", "playerData", playerI, "threat", parseInt(newValue)]];
      dispatch(setValues({updates: updates}));
      gameBroadcast("game_action", {action: "update_values", options:{updates: updates}});
      if (increment > 0) chatBroadcast("game_update",{message: "raises threat by "+increment+" ("+newValue+")."});
      if (increment < 0) chatBroadcast("game_update",{message: "reduces threat by "+(-increment)+" ("+newValue+")."});
      setInputFocusThreat();
    }, 400);
  }


  const handleWillpowerChange = (event) => {
    const newValue = event.target.value;
    setWillpowerValue(newValue);
    const increment = newValue - gameUiWillpower;
    // Set up a delayed broadcast to update the game state that interrupts itself if the button is clicked again shortly after.
    if (delayBroadcast) clearTimeout(delayBroadcast);
    delayBroadcast = setTimeout(function() {
      const updates = [["game", "playerData", playerI, "willpower", parseInt(newValue)]];
      dispatch(setValues({updates: updates}));
      gameBroadcast("game_action", {action: "update_values", options:{updates: updates}});
      if (increment > 0) chatBroadcast("game_update",{message: "raises willpower by "+increment+" ("+newValue+")."});
      if (increment < 0) chatBroadcast("game_update",{message: "reduces willpower by "+(-increment)+" ("+newValue+")."});
      setInputFocusWillpower();
    }, 400);
  }

  const handleSitClick = (action) => {
    // Get up from any seats first
    Object.keys(playerIds).forEach((playeri) => {
      const sittingUserIDi = playerIds[playeri];
      if (sittingUserIDi === myUserID) {
        gameBroadcast("game_action", {action: "set_seat", options: {"player_n": playeri, "user_id": null}});
        chatBroadcast("game_update", {message: "got up from "+playeri+"'s seat."});
      }
    })
    // Sit in seat
    if (action === "sit") {
      gameBroadcast("game_action", {action: "set_seat", options: {"player_n": playerI, "user_id": myUserID}});
      chatBroadcast("game_update",{message: "sat in "+playerI+"'s seat."});
      setObservingPlayerN(playerI);
    } 
  }

  const handleObserveClick = () => {
    if (observingPlayerN === playerI) {
      setObservingPlayerN(null);
      chatBroadcast("game_update",{message: "stopped observing "+playerI+"."});
    } else {
      setObservingPlayerN(playerI);
      chatBroadcast("game_update",{message: "started observing "+playerI+"."});
    }
  }

  const sitButton = () => {
    if (!isLoggedIn) {
      return(<Link to="/login" className="h-full w-1/2 float-left flex justify-center hover:bg-gray-500 text-white">Log In</Link>)
    } else if (sittingUserID) {
      if (sittingUserID === myUserID) {
        return(<div onClick={() => handleSitClick("get_up")} className={"h-full w-1/2 float-left flex justify-center bg-gray-500"}>Get up</div>)
      } else {
        return(<div className={"h-full w-1/2 float-left flex justify-center text-black"}>Occ</div>)
      }
    } else {
      return(<div onClick={() => handleSitClick("sit")} className={"h-full w-1/2 float-left flex justify-center hover:bg-gray-500"}>Sit</div>)
    }
  }
  
  return(
    <div className="float-left h-full pr-1" style={{width: "16%", borderLeft: "1px solid lightgrey"}}>
      <div className="float-left h-full w-2/3">
        <div className="h-1/2 w-full flex justify-center">
          {/* Show First player token */}
          {(firstPlayer === playerI) ? 
            <img 
              className="h-full mr-1 mb-1" 
              src={process.env.PUBLIC_URL + '/images/tokens/firstplayer.png'}
              onClick={(event) => handleFirstPlayerClick(event)}/>
            : null}
          <UserName userID={sittingUserID} defaultName="Empty seat"></UserName>
        </div>

        <div className="h-1/2 w-full cursor-default">
          {sitButton()}
          {/* <div 
            className={"h-full w-1/2 float-left flex justify-center"
            onClick={handleSitClick}
          >Sit</div> */}

          <div 
            className={"h-full w-1/2 float-left flex justify-center "+
              ((observingPlayerN===playerI) ? "bg-gray-500" : "hover:bg-gray-500")}
            onClick={() => handleObserveClick()}
          >Obsv</div>
        </div>

      </div>

      <div className="float-left h-full w-1/3">

        <div className="h-1/2 w-full">
          <div className="h-full w-1/2 float-left flex justify-end">
            <img className="h-full" src={process.env.PUBLIC_URL + '/images/tokens/threat.png'}></img>
          </div>
          <input 
            className="h-full w-1/2 float-left text-center bg-transparent" 
            value={threatValue}
            onChange={handleThreatChange}
            type="number" min="0" step="1"
            disabled={playerN ? false : true}
            onFocus={event => setTyping(true)}
            onBlur={event => setTyping(false)}
            ref={inputRefThreat}
          ></input>
        </div>

        <div className="h-1/2 w-full">
          <div className="h-full w-1/2 float-left flex justify-end">
            <img className="h-full" src={process.env.PUBLIC_URL + '/images/tokens/willpower.png'}></img>
          </div>
          <input 
            className="h-full w-1/2 float-left text-center bg-transparent" 
            value={willpowerValue}
            onChange={handleWillpowerChange}
            type="number" min="0" step="1"
            disabled={playerN ? false : true}
            onFocus={event => setTyping(true)}
            onBlur={event => setTyping(false)}
            ref={inputRefWillpower}
          ></input>
        </div>
      </div>
      
    </div>
  )
})