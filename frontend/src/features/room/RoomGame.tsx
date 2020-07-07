import React from "react";
import { Groups } from "./Groups";
import { GameUIView } from "elixir-backend";
import {ActiveCardProvider} from '../../contexts/ActiveCardContext'
import GameUIViewContext from "../../contexts/GameUIViewContext";

interface Props {
  broadcast: (eventName: string, payload: object) => void;
}

const RoomGame: React.FC<Props> = ({ broadcast }) => {
  console.log('rendring roomgame');
  const gameUIView = React.useContext(GameUIViewContext);

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
