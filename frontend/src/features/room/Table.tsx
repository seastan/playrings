import React from "react";
import Draggable from 'react-draggable';
import cx from "classnames";
import ScoreButton from "../score/ScoreButton";
import GameTeam from "../room/GameTeam";
import useGameUIView from "../../hooks/useGameUIView";
import { GamePlayer } from "elixir-backend";

interface Props {
  emphasizeBidding?: boolean;
  topCard?: null | string;
  bottomCard?: null | string;
  leftCard?: null | string;
  rightCard?: null | string;
  leftPlayer: GamePlayer;
  topPlayer: GamePlayer;
  rightPlayer: GamePlayer;
  bottomPlayer: GamePlayer;
  broadcast: (eventName: string, payload: object) => void;
}

const qNull = (input: number | null) => {
  if (input == null) {
    return "?";
  }
  return input;
};


export const Table: React.FC<Props> = ({
  leftCard,
  topCard,
  rightCard,
  bottomCard,
  leftPlayer,
  topPlayer,
  rightPlayer,
  bottomPlayer,
  emphasizeBidding,
  broadcast,
}) => {
  const gameUIView = useGameUIView();
  const winner = gameUIView != null ? gameUIView.game_ui.game.winner : null;
  const cardHeight = "h-24";
  const bidClasses = {
    "font-semibold text-lg text-blue-800": emphasizeBidding,
  };

  return (
    <div className="h-full w-full relative">
      {winner && (
        <div className="p-6 w-full h-full absolute inset-0 z-40">
          <div className="p-3 bg-white border rounded w-full h-full">
            <h2 className="text-purple-800 font-semibold mb-4">Winner!</h2>
            <div className="mb-2">
              Team:{" "}
              <span className="font-semibold">
                {winner === "east_west" && <GameTeam isEastWest />}
                {winner === "north_south" && <GameTeam isNorthSouth />}
              </span>{" "}
              won.
            </div>
            <ScoreButton />
          </div>
        </div>
      )}
      <Draggable onStop={() => {
        broadcast("move_card", {test: "test", cardx: 100, cardy: 200} );
      }}>
      <div className="h-56 bg-orange-200 border rounded-lg shadow-lg">
        {/* Top row/card */}
        <div className="absolute inset-x-0 top-0 h-0 p-1 flex">
          <div className="mx-auto flex">
            <div className="w-20 px-2 text-right text-sm">
              <span className={cx(bidClasses)}>
                Bid: {qNull(topPlayer.bid)}
              </span>
              <br />
              Tricks: {qNull(topPlayer.tricks_won)}
            </div>
            {topCard && (
              <img
                src={topCard}
                alt=".."
                className={cardHeight + " object-cover rotate-1/2"}
              />
            )}
            <div className="w-20"></div>
          </div>
        </div>

        {/* Bottom row/card */}
        <div className="absolute inset-x-0 bottom-0 h-0 p-1 flex">
          <div className="mx-auto flex -mt-24 items-end">
            <div className="w-20"></div>
            {bottomCard && (
              <img
                src={bottomCard}
                alt=".."
                className={cardHeight + " object-cover"}
              />
            )}
            <div className="w-20 px-2 text-sm">
              <span className={cx(bidClasses)}>
                Bid: {qNull(bottomPlayer.bid)}
              </span>
              <br />
              Tricks: {qNull(bottomPlayer.tricks_won)}
            </div>
          </div>
        </div>

        {/* Left row/card */}
        <div className="absolute inset-y-0 left-0 p-1 flex">
          <div className="my-auto flex flex-col">
            <div className="h-12"></div>
            <div className="h-24 ml-4">
              {leftCard && (
                <img
                  src={leftCard}
                  alt=".."
                  className={cardHeight + " object-cover rotate-1/4"}
                />
              )}
            </div>
            <div className="h-12 text-sm -mt-4 mb-4">
              <span className={cx(bidClasses)}>
                Bid: {qNull(leftPlayer.bid)}
              </span>
              <br />
              Tricks: {qNull(leftPlayer.tricks_won)}
            </div>
          </div>
        </div>

        {/* Right row/card */}
        <div className="absolute inset-y-0 right-0 p-1 flex">
          <div className="my-auto flex flex-col">
            <div className="h-12 mt-4 -mb-4 flex items-end">
              <div className="text-right w-full text-sm pb-1">
                <span className={cx(bidClasses)}>
                  Bid: {qNull(rightPlayer.bid)}
                </span>
                <br />
                Tricks: {qNull(rightPlayer.tricks_won)}
              </div>
            </div>
            <div className="h-24 mr-4">
              {rightCard && (
                <img
                  src={rightCard}
                  alt=".."
                  className={cardHeight + " object-cover rotate-3/4"}
                />
              )}
            </div>
            <div className="h-12"></div>
          </div>
        </div>
      </div></Draggable>
    </div>
  );
};
export default Table;
