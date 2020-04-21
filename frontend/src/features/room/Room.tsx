import React, { useState, useCallback } from "react";
import RotateTableProvider from "./RotateTableProvider";
import RoomGame from "./RoomGame";
import RoomStaging from "./RoomStaging";
import Container from "../../components/basic/Container";
import Chat from "../chat/Chat";

import GameUIViewContext from "../../contexts/GameUIViewContext";
import useChannel from "../../hooks/useChannel";
import { GameUIView } from "elixir-backend";

interface Props {
  slug: string;
}

export const Room: React.FC<Props> = ({ slug }) => {
  const [gameUIView, setGameUIView] = useState<GameUIView | null>(null);

  const onChannelMessage = useCallback((event, payload) => {
    //console.log("[room] Got channel message", event, payload);
    if (
      event === "phx_reply" &&
      payload.response != null &&
      payload.response.game_ui_view != null
    ) {
      const { game_ui_view } = payload.response;
      //console.log("Got new game state: ", game_ui_view);
      setGameUIView(game_ui_view);
    }
  }, []);
  const broadcast = useChannel(`room:${slug}`, onChannelMessage);

  const statusIs = (targetStatus: string) =>
    gameUIView != null &&
    gameUIView.game_ui.status != null &&
    gameUIView.game_ui.status === targetStatus;

  const isStaging = statusIs("staging");
  const isPlaying = statusIs("playing");

  const game_ui = gameUIView != null ? gameUIView.game_ui : null;
  return (
    <Container>
      <div>
        <div className="text-lg">{slug}</div>
        {isStaging && <RoomStaging gameState={game_ui} broadcast={broadcast} />}
        {isPlaying && gameUIView != null && (
          <GameUIViewContext.Provider value={gameUIView}>
            <RotateTableProvider gameUIView={gameUIView}>
              <div className="flex flex-wrap">
                <div className="w-full lg:w-3/4 xl:w-4/6 mb-4">
                  <RoomGame gameUIView={gameUIView} broadcast={broadcast} />
                </div>
                <div className="w-full lg:w-1/4 xl:w-2/6 mb-4">
                  <div className=" bg-white max-w-none p-4 mx-auto rounded-lg mt-4 ">
                    <Chat roomName={gameUIView.game_ui.game_name} />
                  </div>
                </div>
              </div>
            </RotateTableProvider>
          </GameUIViewContext.Provider>
        )}
      </div>
    </Container>
  );
};
export default Room;
