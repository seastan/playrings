import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import RoomGame from "./RoomGame";
import useProfile from "../../hooks/useProfile";
import { setObservingPlayerN, setPlayerN } from "../store/playerUiSlice";
import BroadcastContext from "../../contexts/BroadcastContext";
import { usePlugin } from "./hooks/usePlugin";
import { PluginProvider } from "../../contexts/PluginContext";
import { useGameDefinition } from "./hooks/useGameDefinition";



const getPlayerN = (playerInfo, id) => {
  if (!playerInfo) return null;
  var playerN = null;
  Object.keys(playerInfo).forEach(playerI => {
    if (playerInfo[playerI]?.id === id) playerN = playerI;
  })
  return playerN;
}

export const RoomProviders = ({ gameBroadcast, chatBroadcast }) => {
  console.log("Rendering RoomProviders");
  const dispatch = useDispatch();
  const playerInfo = useSelector(state => state?.gameUi?.playerInfo);
  const myUser = useProfile();
  const playerN = getPlayerN(playerInfo, myUser?.id);
  const gameDef = useGameDefinition();
  const pluginId = usePlugin()?.id;
  const [playerNSet, setPlayerNSet] = useState(false);

  useEffect(() => {
    dispatch(setPlayerN(playerN));
    if (playerN) dispatch(setObservingPlayerN(playerN)); // For a spectator (where playerN is null), leave as the default value
    setPlayerNSet(true);
  }, [playerN])

  const gameBackgroundUrl = gameDef?.backgroundUrl;
  const userBackgroundUrl = myUser?.plugin_settings?.[pluginId]?.background_url;

  var backgroundUrl = null;
  if (gameBackgroundUrl && gameBackgroundUrl !== "") backgroundUrl = gameBackgroundUrl;
  if (userBackgroundUrl && userBackgroundUrl !== "") backgroundUrl = userBackgroundUrl;

  return (
      <div className="background"
        style={{
          height: "97vh",
          background: backgroundUrl ? `url(${backgroundUrl})` : "",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPositionY: "50%",
        }}>
        <BroadcastContext.Provider value={{gameBroadcast, chatBroadcast}}>
          {playerNSet && <RoomGame/>}
        </BroadcastContext.Provider>
      </div>
  );
};
export default RoomProviders;
