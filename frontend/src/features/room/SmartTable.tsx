import React, { useContext } from "react";
import Table from "./Table";
import { Card, GameUIView, Seat, TrickCard } from "elixir-backend";
import RotateTableContext from "../../contexts/RotateTableContext";

interface Props {
  gameUIView: GameUIView;
  broadcast: (eventName: string, payload: object) => void;
}

let arrow = `/images/cards3/red-arrow-down.png`;

const imageUrlForCard = (card: Card) => {
  //let jack = `/images/cards3/11c.png`;
  return `/images/cards3/${card.rank.toString()}${card.suit}.png`;
};

const cardFromTrick = (trick: Array<TrickCard>, seat: Seat) => {
  const thisCardA = trick.filter((tc) => tc.seat === seat);
  if (thisCardA.length === 0) {
    return null;
  }
  const thisCard = thisCardA[0].card;
  return imageUrlForCard(thisCard);
};

export const SmartTable: React.FC<Props> = ({ gameUIView, broadcast }) => {
  const { game } = gameUIView.game_ui;
  const { trick } = game;

  const rtcv = useContext(RotateTableContext);
  if (rtcv == null) {
    return null;
  }
  const {
    bottomSeat,
    topSeat,
    rightSeat,
    leftSeat,
    bottomPlayer,
    topPlayer,
    rightPlayer,
    leftPlayer,
  } = rtcv;

  // Arrow indicators if it's that seat's turn
  const bottomTurn = game.turn === bottomSeat ? arrow : null;
  const topTurn = game.turn === topSeat ? arrow : null;
  const rightTurn = game.turn === rightSeat ? arrow : null;
  const leftTurn = game.turn === leftSeat ? arrow : null;

  // The card they played during the trick
  const bottomCard = cardFromTrick(trick, bottomSeat);
  const topCard = cardFromTrick(trick, topSeat);
  const rightCard = cardFromTrick(trick, rightSeat);
  const leftCard = cardFromTrick(trick, leftSeat);

  return (
    <Table
      leftCard={leftTurn || leftCard}
      topCard={topTurn || topCard}
      rightCard={rightTurn || rightCard}
      bottomCard={bottomTurn || bottomCard}
      leftPlayer={leftPlayer}
      topPlayer={topPlayer}
      rightPlayer={rightPlayer}
      bottomPlayer={bottomPlayer}
      emphasizeBidding={game.status === "bidding"}
      groupTable={game.groups.table}
      broadcast={broadcast}
    />
  );
};
export default SmartTable;
