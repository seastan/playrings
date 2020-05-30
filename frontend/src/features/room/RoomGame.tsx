import React, { useContext, useEffect } from "react";
import cx from "classnames";
import PlayerSeat from "./PlayerSeat";
import Table from "./Table";
import Hand from "./Hand";
import Bid from "./Bid";
import Groups from "./Groups";
import ScoreHeader from "../score/ScoreHeader";
import RotateTableContext from "../../contexts/RotateTableContext";
import { GameUIView } from "elixir-backend";
//import CARDHEIGHT from "../../game_constants";
export const CARDHEIGHT = 120;
const CARDWIDTH = 86;

interface Props {
  gameUIView: GameUIView;
  broadcast: (eventName: string, payload: object) => void;
}

const RoomGame: React.FC<Props> = ({ gameUIView, broadcast }) => {

  return (
    <div className="flex-1 flex flex-col mb-4">
      <div className="w-4/5 bg-gray-500" style={{height:`${CARDHEIGHT*5}px`}}></div>
    </div>
      // <Groups
      //   gameUIView={gameUIView} 
      //   broadcast={broadcast}
      // />
  )
}   

export default RoomGame;
