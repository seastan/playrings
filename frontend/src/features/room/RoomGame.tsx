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
import { Constants } from "../../game_constants";

interface Props {
  gameUIView: GameUIView;
  broadcast: (eventName: string, payload: object) => void;
}

const RoomGame: React.FC<Props> = ({ gameUIView, broadcast }) => {

  return (
    <div className="flex flex-col flex-1">
      <div>
        Navigation bar
      </div>
      <div className="flex-grow flex">
         <div className="w-4/5 bg-gray-500">

          <div className="bg-gray-600 flex flex-1" style={{height: "20%"}}>
            <div className="bg-gray-200 w-8/12"></div>
            <div className="bg-gray-300 w-1/12"></div>
            <div className="bg-gray-200 w-1/12"></div>
            <div className="bg-gray-300 w-2/12"></div>
          </div>
          <div className="bg-gray-700" style={{height: "20%"}}></div>
          <div className="bg-gray-600" style={{height: "20%"}}></div>
          <div className="bg-gray-700" style={{height: "20%"}}></div>
          <div className="bg-gray-600" style={{height: "20%"}}></div>

          
        </div>
      </div>
      <div>
        Social links
      </div>
    </div>

    // <div className="flex flex-1">
    //   <div className="w-4/5 bg-gray-500" >
    //     <div className="bg-gray-600 flex flex-1" style={{height: "19%"}}>
    //       <div className="bg-gray-200 w-8/12"></div>
    //       <div className="bg-gray-300 w-1/12"></div>
    //       <div className="bg-gray-200 w-1/12"></div>
    //       <div className="bg-gray-300 w-2/12"></div>
    //     </div>
    //     <div className="bg-gray-700" style={{height: "19%"}}></div>
    //     <div className="bg-gray-600" style={{height: "19%"}}></div>
    //     <div className="bg-gray-700" style={{height: "19%"}}></div>
    //     <div className="bg-gray-600" style={{height: "19%"}}></div>
    //   </div>
    //   <div className="w-1/5 bg-gray-400" >
    //     <div className="bg-gray-200" style={{height: "10%"}}></div>
    //     <div className="bg-gray-300" style={{height: "10%"}}></div>
    //     <div className="bg-gray-200" style={{height: "10%"}}></div>
    //     <div className="bg-gray-300" style={{height: "20%"}}></div>
    //     <div className="bg-gray-400" style={{height: "50%"}}></div>
    //   </div>
    // </div>
    //   // <Groups
    //   //   gameUIView={gameUIView} 
    //   //   broadcast={broadcast}
    //   // />
  )
}   

export default RoomGame;
