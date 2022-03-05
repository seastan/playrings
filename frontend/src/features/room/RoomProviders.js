import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import RoomGame from "./RoomGame";
import { GetPlayerN } from "./Helpers";
import useProfile from "../../hooks/useProfile";
import { setPlayerN } from "./roomUiSlice";

export const RoomProviders = ({ gameBroadcast, chatBroadcast }) => {
  console.log("Rendering RoomProviders");
  const dispatch = useDispatch();
  const playerIds = {player1: 1} //useSelector(state => state?.gameUi?.playerIds);
  const myUser = useProfile();
  const playerN = GetPlayerN(playerIds, myUser?.id);
  dispatch(setPlayerN(playerN));
  console.log("provider playerIds", playerIds)

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
        <RoomGame gameBroadcast={gameBroadcast} chatBroadcast={chatBroadcast}/>
      </div>
  );
};
export default RoomProviders;
