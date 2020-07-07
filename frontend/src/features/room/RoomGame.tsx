import React from "react";
import { Groups } from "./Groups";
import { GameUIView } from "elixir-backend";
import {ActiveCardProvider} from '../../contexts/ActiveCardContext'
import GameUIViewContext from "../../contexts/GameUIViewContext";

interface Props {
  gameUIView: any;
  broadcast: (eventName: string, payload: object) => void;
}

const RoomGame: React.FC<Props> = ({ broadcast, gameUIView }) => {
  console.log('rendring roomgame');
  //const gameUIView = React.useContext(GameUIViewContext);
  //if (gameUIView) broadcast("update_groups",{groups: gameUIView.game_ui.game.groups});
  return (
    <ActiveCardProvider value={null}>
      <Groups
        groups={gameUIView?.game_ui.game.groups}
        broadcast={broadcast}
      />
    </ActiveCardProvider>
 
  )
}   

export default RoomGame;
