import React, { useContext } from "react";
import Table from "./Table";
import { Card, GameUIView, Seat, TrickCard } from "elixir-backend";
import RotateTableContext from "../../contexts/RotateTableContext";

interface Props {
  gameUIView: GameUIView;
  broadcast: (eventName: string, payload: object) => void;
}

export const SmartTable: React.FC<Props> = ({ gameUIView, broadcast }) => {
  return (
    <Table
      gameUIView={gameUIView}
      broadcast={broadcast}
    />
  );
};
export default SmartTable;
