import React, { useContext } from "react";
import { useSelector, useDispatch } from 'react-redux';
import UserName from "../user/UserName";
import useProfile from "../../hooks/useProfile";
import useIsLoggedIn from "../../hooks/useIsLoggedIn";
import { Link } from "react-router-dom";
import { setDropdownMenu, setObservingPlayerN, setTyping } from "../store/playerUiSlice";
import BroadcastContext from "../../contexts/BroadcastContext";
import { TopBarUserCounter } from "./TopBarUserCounter";
import { useGameDefinition } from "./functions/useGameDefinition";
import { useSiteL10n } from "../../hooks/useSiteL10n";

export const TopBarUser = React.memo(({
  playerI
}) => {
  const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
  const dispatch = useDispatch();
  const siteL10n = useSiteL10n();
  const gameDef = useGameDefinition();
  const playerN = useSelector(state => state?.playerUi?.playerN);
  const observingPlayerN = useSelector(state => state?.playerUi?.observingPlayerN);
  const playerInfo = useSelector(state => state?.gameUi?.playerInfo);
  const playerData = useSelector(state => state?.gameUi?.game?.playerData); 
  const playerDataPlayerN = useSelector(state => state?.gameUi?.game?.playerData?.[playerI]);  
  const firstPlayer = useSelector(state => state?.gameUi?.game?.firstPlayer);  
  const isLoggedIn = useIsLoggedIn();
  const myUser = useProfile();
  const myUserID = myUser?.id;


  console.log("Rendering TopBarUser ", playerI, playerInfo, playerData, playerDataPlayerN);
  if (!playerInfo) return null;
  if (!playerDataPlayerN) return null;

  const sittingUserID = playerInfo[playerI]?.id;

  const handleFirstPlayerClick = (event) => {
    event.stopPropagation();
    if (!playerN) return;
    const dropdownMenu = {
        type: "firstPlayer",
        title: "Set first player",
    }
    dispatch(setDropdownMenu(dropdownMenu));
  }
  
  // If not observing anyone, observe yourself
  if (!observingPlayerN && (myUserID === sittingUserID)) dispatch(setObservingPlayerN(playerI));

  const handleSitClick = (action) => {
    // Get up from any seats first
    Object.keys(playerInfo).forEach((playeri) => {
      const sittingUserIDi = playerInfo[playeri]?.id;
      if (sittingUserIDi === myUserID) {
        gameBroadcast("set_seat", {"player_i": playeri, "new_user_id": null});
        chatBroadcast("game_update", {message: "got up from "+playeri+"'s seat."});
      }
    })
    // Sit in seat
    if (action === "sit") {
      gameBroadcast("set_seat", {"player_i": playerI, "new_user_id": myUserID, "new_user_alias": myUser.alias});
      chatBroadcast("game_update",{message: "sat in "+playerI+"'s seat."});
      dispatch(setObservingPlayerN(playerI));
    } 
  }

  const handleObserveClick = () => {
    if (observingPlayerN === playerI) {
      dispatch(setObservingPlayerN(null));
      chatBroadcast("game_update",{message: "stopped observing "+playerI+"."});
    } else {
      dispatch(setObservingPlayerN(playerI));
      chatBroadcast("game_update",{message: "started observing "+playerI+"."});
    }
  }

  const sitButton = () => {
    if (!isLoggedIn) {
      return(<Link to="/login" className="h-full w-1/2 float-left flex justify-center hover:bg-gray-500 text-white">Log In</Link>)
    } else if (sittingUserID) {
      if (sittingUserID === myUserID) {
        return(<div onClick={() => handleSitClick("get_up")} className={"h-full w-1/2 float-left flex justify-center bg-gray-500"}>{siteL10n("getUp")}</div>)
      } else {
        return(<div className={"h-full w-1/2 float-left flex justify-center text-black"}>{siteL10n("taken")}</div>)
      }
    } else {
      return(<div onClick={() => handleSitClick("sit")} className={"h-full w-1/2 float-left flex justify-center hover:bg-gray-500"}>{siteL10n("sit")}</div>)
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
              src={gameDef?.firstPlayerImageUrl}
              onClick={(event) => handleFirstPlayerClick(event)}/>
            : null}
          <UserName userID={sittingUserID} defaultName="Empty seat"/>
        </div>

        <div className="h-1/2 w-full cursor-default">
          {sitButton()}
          <div 
            className={"h-full w-1/2 float-left flex justify-center "+
              ((observingPlayerN===playerI) ? "bg-gray-500" : "hover:bg-gray-500")}
            onClick={() => handleObserveClick()}
          >{siteL10n("look")}</div>
        </div>
      </div>

      <div className="float-left h-full w-1/3">
        {gameDef?.topBarCounters?.player.map((menuItem, index) => {
          return(
            <div key={index} className="h-1/2 w-full">
              <TopBarUserCounter 
                playerI={playerI}
                playerProperty={menuItem.playerProperty} 
                imageUrl={menuItem.imageUrl} 
                labelId={menuItem.labelId}/>
            </div>
          )
        })}
      </div>
      
    </div>
  )
})