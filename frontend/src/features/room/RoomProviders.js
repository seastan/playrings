import React from "react";
import { useSelector } from 'react-redux';
import RoomGame from "./RoomGame";
import {KeypressProvider} from '../../contexts/KeypressContext';
import {ActiveCardProvider} from '../../contexts/ActiveCardContext';
import {DropdownMenuProvider} from '../../contexts/DropdownMenuContext';
import {MousePositionProvider} from '../../contexts/MousePositionContext';
import {TouchModeProvider} from '../../contexts/TouchModeContext';
import {TouchActionProvider} from '../../contexts/TouchActionContext';
import { GetPlayerN } from "./Helpers";
import useProfile from "../../hooks/useProfile";
import { CardSizeFactorProvider } from "../../contexts/CardSizeFactorContext";
import { ObservingPlayerNProvider } from "../../contexts/ObservingPlayerNContext";

export const RoomProviders = ({ gameBroadcast, chatBroadcast }) => {
  console.log("Rendering RoomProviders");
  const storePlayerIds = state => state?.gameUi?.playerIds;
  const playerIds = useSelector(storePlayerIds);
  const myUser = useProfile();
  const myUserID = myUser?.id;
  const playerN = GetPlayerN(playerIds, myUserID);
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
          <KeypressProvider value={{}}>
            <TouchModeProvider value={false}>
              <TouchActionProvider value={null}>
                <MousePositionProvider value={null}>
                  <DropdownMenuProvider value={null}>
                    <ActiveCardProvider value={null}>
                      <CardSizeFactorProvider value={null}>
                        <ObservingPlayerNProvider value={null}>
                          <RoomGame playerN={playerN} gameBroadcast={gameBroadcast} chatBroadcast={chatBroadcast}/>
                        </ObservingPlayerNProvider>
                      </CardSizeFactorProvider>
                    </ActiveCardProvider>
                  </DropdownMenuProvider>
                </MousePositionProvider>
              </TouchActionProvider>
            </TouchModeProvider>
          </KeypressProvider>
      </div>
  );
};
export default RoomProviders;
