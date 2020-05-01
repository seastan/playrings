import React from "react";
import { Link } from "react-router-dom";
import UserSitting from "./UserSitting";
import Button from "../../components/basic/Button";
import useIsLoggedIn from "../../hooks/useIsLoggedIn";
import { Seat, SittingPlayer } from "elixir-backend";

interface Props {
  whichSeat: Seat;
  broadcast: (eventName: string, payload: object) => void;
  sittingPlayer: SittingPlayer;
  isWinner?: boolean;
}

export const PlayerSeat: React.FC<Props> = ({
  broadcast,
  sittingPlayer,
  whichSeat,
  isWinner,
}) => {
  const isLoggedIn = useIsLoggedIn();
  if (sittingPlayer == null) {
    // Empty Seat
    if (!isWinner) {
      // Empty Seat + Game not over yet
      if (isLoggedIn) {
        return (
          <div 
            style={{zIndex:-1}}
          >
          <Button onClick={() => broadcast("sit", { whichSeat })}>Sit</Button>
          </div>
        );
      } else {
        return (
          <span 
            style={{zIndex:1}}
            className="text-gray-700 bg-gray-100 text-sm border p-1 mt-1 rounded " 
          >
            <Link to="/login" className="mr-1">
              Log In
            </Link>
            to Sit
          </span>
        );
      }
    } else {
      // Empty seat + Game is over
      return null;
    }
  } else if (sittingPlayer === "bot") {
    return <div>Bot</div>;
  } else if (typeof sittingPlayer == "number") {
    return <UserSitting userId={sittingPlayer} />;
  } else {
    return <div>Unknown</div>;
  }
};
export default PlayerSeat;
