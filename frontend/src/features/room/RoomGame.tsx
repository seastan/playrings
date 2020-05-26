import React, { useContext } from "react";
import cx from "classnames";
import PlayerSeat from "./PlayerSeat";
import Table from "./Table";
import Hand from "./Hand";
import Bid from "./Bid";
import Groups from "./Groups";
import ScoreHeader from "../score/ScoreHeader";
import RotateTableContext from "../../contexts/RotateTableContext";
import { GameUIView } from "elixir-backend";

interface Props {
  gameUIView: GameUIView;
  broadcast: (eventName: string, payload: object) => void;
}

const RoomGame: React.FC<Props> = ({ gameUIView, broadcast }) => {

  return (
      <Groups
        gameUIView={gameUIView} 
        broadcast={broadcast}
      />
  )
}   

export default RoomGame;
