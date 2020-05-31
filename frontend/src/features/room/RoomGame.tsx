import React, { useContext, useEffect, useState } from "react";
import cx from "classnames";
import PlayerSeat from "./PlayerSeat";
import Table from "./Table";
import Hand from "./Hand";
import Chat from "../chat/Chat";
import Groups from "./Groups";
import ScoreHeader from "../score/ScoreHeader";
import RotateTableContext from "../../contexts/RotateTableContext";
import { GameUIView } from "elixir-backend";
import { Constants } from "../../game_constants";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  gameUIView: GameUIView;
  broadcast: (eventName: string, payload: object) => void;
}

const RoomGame: React.FC<Props> = ({ gameUIView, broadcast }) => {
  const [showScratch, setShowScratch] = useState(false);

  function toggleScratch() {
    if (showScratch) setShowScratch(false);
    else setShowScratch(true);
  }

  return (
    <div className="flex flex-1">
      {/* Right panel */}
      <div className="flex flex-col bg-gray-400 w-8">
        <div className="flex flex-col flex-1 bg-gray-600 text-center p-1" style={{writingMode:"vertical-rl"}}>Refresh</div>
        <div className="flex flex-col flex-1 bg-gray-600 text-center p-1" style={{writingMode:"vertical-rl"}}>Combat</div>
        <div className="flex flex-col flex-1 bg-gray-600 text-center p-1" style={{writingMode:"vertical-rl"}}>Encounter</div>
        <div className="flex flex-col flex-1 bg-gray-600 text-center p-1" style={{writingMode:"vertical-rl"}}>Travel</div>
        <div className="flex flex-col flex-1 bg-gray-600 text-center p-1" style={{writingMode:"vertical-rl"}}>Quest</div>
        <div className="flex flex-col flex-1 bg-gray-600 text-center p-1" style={{writingMode:"vertical-rl"}}>Planning</div>
        <div className="flex flex-col flex-1 bg-gray-600 text-center p-1" style={{writingMode:"vertical-rl"}}>Resource</div>
      </div>



      {/* Middle panel */}
      <div className="flex flex-1 w-4/5 bg-gray-500">
        <div className="flex flex-col flex-1">
          <div>
            Navigation bar
          </div>
          <div className="flex-grow flex flex-col">

            <div className="bg-gray-600 flex flex-1" style={{maxHeight: "20%"}}>
              <div className="bg-gray-200 w-8/12"></div>
              <div className="bg-gray-300 w-1/12"></div>
              <div className="bg-gray-200 w-1/12"></div>
              <div className="bg-gray-300 w-2/12"></div>
            </div>
            <div className="bg-gray-700 flex flex-1" style={{maxHeight: "20%"}}></div>
            <div className="bg-gray-600 flex flex-1" style={{maxHeight: "20%"}}></div>
            <div className="bg-gray-700 flex flex-1" style={{maxHeight: "20%"}}>
              <div className="bg-gray-500 w-11/12"></div>
              <div className="bg-gray-300 w-1/12"></div>
              </div>
            <div className="bg-gray-600 flex flex-1" style={{maxHeight: "20%"}}>
              <div className="bg-gray-200 w-10/12"></div>
              <div className="bg-gray-300 w-1/12"></div>
              <div className="bg-gray-200 w-1/12"></div>
            </div>
          </div>
          <div>
            Social links
          </div>
        </div>
      </div>
      {/* Right panel */}
      <div className="flex w-1/5 bg-gray-400" >
        <div className="flex flex-col flex-1">
          <div>
            Navigation bar
          </div>
          <div className="flex-grow flex flex-col">

            <div className="bg-gray-600 flex flex-1" style={{minHeight: "50%", maxHeight: "50%"}}>
            </div>
            <div className="bg-gray-700 flex flex-1 overflow-hidden" style={{minHeight: "20%"}}>
              {gameUIView != null && (
                <Chat roomName={gameUIView.game_ui.game_name} />
              )}
            </div>
            <div className="bg-gray-800 flex flex-1" style={{minHeight: "30%", display: showScratch ? "block" : "none"}}>        
              <div className="bg-gray-300 flex flex-1" style={{height: "33.3%"}}></div>
              <div className="bg-gray-400 flex flex-1" style={{height: "33.3%"}}></div>
              <div className="bg-gray-500 flex flex-1" style={{height: "33.4%"}}></div>
            </div>
          </div>
          <div className="text-center" onClick={() => toggleScratch()}>
            <FontAwesomeIcon className="text-white" icon={showScratch ? faChevronDown : faChevronUp}/>
          </div>
        </div>
      </div>
    </div>
  )
}   

export default RoomGame;
