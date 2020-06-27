import React, { useContext, useEffect, useState } from "react";
import cx from "classnames";
import PlayerSeat from "./PlayerSeat";
import Hand from "./Hand";
import { Groups } from "./Groups";
import ScoreHeader from "../score/ScoreHeader";
import RotateTableContext from "../../contexts/RotateTableContext";
import { GameUIView } from "elixir-backend";
import {ActiveCardProvider} from '../../contexts/ActiveCardContext'

interface Props {
  gameUIView: GameUIView;
  broadcast: (eventName: string, payload: object) => void;
}

const RoomGame: React.FC<Props> = ({ gameUIView, broadcast }) => {

  return (
    <ActiveCardProvider value={null}>
      <Groups 
        gameUIView={gameUIView}
        broadcast={broadcast}
      />
    </ActiveCardProvider>
 
  )
}   

export default RoomGame;
