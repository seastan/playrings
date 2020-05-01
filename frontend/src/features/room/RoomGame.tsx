import React, { useContext } from "react";
import cx from "classnames";
import PlayerSeat from "./PlayerSeat";
import SmartTable from "./SmartTable";
import Hand from "./Hand";
import Bid from "./Bid";
import ScoreHeader from "../score/ScoreHeader";
import RotateTableContext from "../../contexts/RotateTableContext";
import { GameUIView } from "elixir-backend";

interface Props {
  gameUIView: GameUIView;
  broadcast: (eventName: string, payload: object) => void;
}

const RoomGame: React.FC<Props> = ({ gameUIView, broadcast }) => {
  const { game } = gameUIView.game_ui;
  const rowMaxWidth = "max-w-xl";
  const showHand = true;
  const showBid = game.status === "bidding" && game.turn === gameUIView.my_seat;
  const isWinner = game.winner !== null;

  const rtcv = useContext(RotateTableContext);
  if (rtcv == null) {
    return null;
  }
  const {
    bottomSeat,
    topSeat,
    rightSeat,
    leftSeat,
    bottomUserId,
    topUserId,
    rightUserId,
    leftUserId,
  } = rtcv;

  return (
    <div className="h-full">
      <SmartTable 
        gameUIView={gameUIView} 
        broadcast={broadcast}
      />
    </div>
  )
}
      {/* <div className={cx("flex mt-6", rowMaxWidth)}>
        <ScoreHeader
          round_number={game.round_number}
          score={gameUIView.game_ui.game.score}
        />
      </div> 
       <div className={cx("flex mt-2", rowMaxWidth)}>
        <div className="w-1/5 h-12"></div>
        <div className="w-3/5 h-12 flex justify-center items-center"> 
           Top Player 
          <div 
          style={{zIndex:2000}}
          >
          <PlayerSeat
            broadcast={broadcast}
            whichSeat={topSeat}
            sittingPlayer={topUserId}
            isWinner={isWinner}
          />
          </div> 
         </div>
        <div className="w-1/5 xbg-gray-100 h-12"></div>
      </div> 
       <div className={cx("flex my-1 h-56", rowMaxWidth)}>
        <div className="h-full w-1/5 h-32 flex items-center justify-center">
           {/* Left Player 
          {/* <PlayerSeat
            broadcast={broadcast}
            whichSeat={leftSeat}
            sittingPlayer={leftUserId}
            isWinner={isWinner}
          /> 
         </div>
        <div className="h-56 w-3/5 relative"> 

         </div>
        <div className="h-full w-1/5 h-32 flex items-center justify-center"> 
          Right player 
           <PlayerSeat
            broadcast={broadcast}
            whichSeat={rightSeat}
            sittingPlayer={rightUserId}
            isWinner={isWinner}
          /> 
        </div>
      </div> 

       {showBid && (
        <div className={cx("flex mb-2", rowMaxWidth)}>
          <div className="w-3/5 mx-auto">
            <Bid broadcast={broadcast} />
          </div>
        </div>
      )} 

      <div className={cx("flex mb-2", rowMaxWidth)}>
        <div className="w-1/5"></div>
        <div className="w-3/5 flex justify-center items-start"> 
           Bottom player 
           <PlayerSeat
            broadcast={broadcast}
            whichSeat={bottomSeat}
            sittingPlayer={bottomUserId}
            isWinner={isWinner}
          /> 
        </div>
        <div className="w-1/5"></div>
      </div> 
       {showHand && (
        <div className={cx(rowMaxWidth, "flex justify-center ml-8")}>
          <Hand cards={gameUIView.my_hand} broadcast={broadcast} />
        </div>
      )} */}
    

export default RoomGame;
