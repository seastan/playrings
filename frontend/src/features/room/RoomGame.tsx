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

  return (
    <ActiveCardProvider value={null}>
      <Groups 
        broadcast={broadcast}
      />
    </ActiveCardProvider>
 
  )
}   

export default RoomGame;
