import React from "react";
import PlayerSeat from "./PlayerSeat";
import RoomStagingTimer from "./RoomStagingTimer";
import Button from "../../components/basic/Button";
import Chat from "../chat/Chat";
import useIsLoggedIn from "../../hooks/useIsLoggedIn";
import { GameUI } from "elixir-backend";

interface Props {
  gameState: GameUI | null;
  broadcast: (eventName: string, payload: object) => void;
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gridGap: "1.5rem",
};

export const RoomStaging: React.FC<Props> = ({ broadcast, gameState }) => {
  const isLoggedIn = useIsLoggedIn();
  if (gameState == null) {
    return null;
  }
  const { seats } = gameState;
  return (
    <div>
      <div className="bg-white max-w-none p-4 mx-px rounded-lg mt-4">
        <h2 className="text-blue-800 font-semibold">Waiting For Players</h2>

        <div className="mt-4" style={gridStyle}>
          <div></div>
          <div className="text-center">
            North
            <div>
              <PlayerSeat
                broadcast={broadcast}
                sittingPlayer={seats.north.sitting}
                whichSeat="north"
              />
            </div>
          </div>
          <div></div>
          {/* --row-- */}
          <div className="text-right">
            West
            <div>
              <PlayerSeat
                broadcast={broadcast}
                sittingPlayer={seats.west.sitting}
                whichSeat="west"
              />
            </div>
          </div>
          <div></div>
          <div className="text-left">
            East
            <div>
              <PlayerSeat
                broadcast={broadcast}
                sittingPlayer={seats.east.sitting}
                whichSeat="east"
              />
            </div>
          </div>
          {/* --row-- */}
          <div></div>
          <div className="text-center">
            South
            <div>
              <PlayerSeat
                broadcast={broadcast}
                sittingPlayer={seats.south.sitting}
                whichSeat="south"
              />
            </div>
          </div>
          <div></div>
        </div>

        {isLoggedIn && (
          <div className="mt-6">
            {/* Only show button if I am sitting? */}
            {/* Hide disable if seats are full, or timer is running */}
            <Button onClick={() => broadcast("invite_bots", {})}>
              Invite bots
            </Button>
          </div>
        )}

        <RoomStagingTimer when_seats_full={gameState.when_seats_full} />
      </div>
      <div className=" bg-white max-w-none p-4 mx-auto rounded-lg mt-4 ">
        <Chat roomName={gameState.game_name} />
      </div>
    </div>
  );
};
export default RoomStaging;
