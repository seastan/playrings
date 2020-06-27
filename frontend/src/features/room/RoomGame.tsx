import React from "react";
import { Groups } from "./Groups";
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
