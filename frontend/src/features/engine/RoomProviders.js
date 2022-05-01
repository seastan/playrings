import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import RoomGame from "./RoomGame";
import useProfile from "../../hooks/useProfile";
import { setPlayerN } from "../store/playerUiSlice";
import { GetPlayerN } from "../plugins/lotrlcg/functions/helpers";
import BroadcastContext from "../../contexts/BroadcastContext";

export const RoomProviders = ({ gameBroadcast, chatBroadcast }) => {
  console.log("Rendering RoomProviders");
  const dispatch = useDispatch();
  const playerInfo = useSelector(state => state?.gameUi?.playerInfo);
  const myUser = useProfile();
  const playerN = GetPlayerN(playerInfo, myUser?.id);
  dispatch(setPlayerN(playerN));

  return (
      <div className="background"
        style={{
          height: "97vh",
          background: `url(${myUser?.background_url ? myUser.background_url : "https://i.imgur.com/sHn4yAA.jpg"})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPositionY: "50%",
        }}
      >
        <BroadcastContext.Provider value={{gameBroadcast, chatBroadcast}}>
          <RoomGame/>
        </BroadcastContext.Provider>
      </div>
  );
};
export default RoomProviders;
