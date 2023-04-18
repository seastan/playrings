import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import RoomGame from "./RoomGame";
import useProfile from "../../hooks/useProfile";
import { setPlayerN } from "../store/playerUiSlice";
import { getPlayerN } from "../plugins/lotrlcg/functions/helpers";
import BroadcastContext from "../../contexts/BroadcastContext";
import { usePlugin } from "./functions/usePlugin";
import { PluginProvider } from "../../contexts/PluginContext";

export const RoomProviders = ({ gameBroadcast, chatBroadcast }) => {
  console.log("Rendering RoomProviders");
  const dispatch = useDispatch();
  const playerInfo = useSelector(state => state?.gameUi?.playerInfo);
  const myUser = useProfile();
  const playerN = getPlayerN(playerInfo, myUser?.id);
  useEffect(() => {
    dispatch(setPlayerN(playerN));
  }, [playerN])
  

  return (
      <div className="background"
        style={{
          height: "97vh",
          background: `url(${myUser?.background_url ? myUser.background_url : "https://i.imgur.com/sHn4yAA.jpg"})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPositionY: "50%",
        }}>
        <BroadcastContext.Provider value={{gameBroadcast, chatBroadcast}}>
          <PluginProvider>
            <RoomGame/>
          </PluginProvider>
        </BroadcastContext.Provider>
      </div>
  );
};
export default RoomProviders;
