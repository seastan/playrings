import React, { useState, useCallback } from "react";
import RotateTableProvider from "./RotateTableProvider";
import RoomGame from "./RoomGame";

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

  return (
    // <Container>
      <div className="gamebackground"
        style={{height: "97vh"}}
      >
        {gameUIView != null && (
          <GameUIViewContext.Provider value={gameUIView}>
            <RotateTableProvider gameUIView={gameUIView}>
                  <RoomGame gameUIView={gameUIView} broadcast={broadcast} />
                {/* <div className="w-full lg:w-1/6 xl:w-1/6 mb-4">
                  <div className=" bg-white max-w-none p-4 mx-auto rounded-lg mt-4 ">
                    <Chat roomName={gameUIView.game_ui.game_name} />
                  </div>
                </div> */}
            </RotateTableProvider>
          </GameUIViewContext.Provider>
        )}
      </div>
    // </Container>
  );
};
export default Room;
