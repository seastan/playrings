import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Draggable from 'react-draggable';
import UserName from "../user/UserName";
import { setShowPlayersInRoom } from "../store/playerUiSlice";

const windowClass = "insert-auto overflow-auto bg-gray-700 border max-w-lg rounded-lg outline-none text-white";
const windowStyle = {
  position:"absolute", 
  zIndex: 1e7, 
  right: "30px", 
  top: "200px", 
  width:"300px", 
  opacity: "50%",
}
const col1Class = "w-1/ 3";
const col2Class = "w-2/3";

export const PlayersInRoom = React.memo(({}) => {
  const showWindow = useSelector(state => state?.playerUi?.showPlayersInRoom);
  const sockets = useSelector(state => state?.gameUi?.sockets);
  const dispatch = useDispatch();
  console.log("Rendering PlayersInRoom", sockets);
  if (!showWindow) return;
  return(
    <Draggable>
      <div className={windowClass} style={windowStyle}>
        <div className="w-full bg-gray-500" style={{height: "25px"}}>
          <FontAwesomeIcon 
            className="ml-2" 
            icon={faTimes} 
            onMouseUp={() => dispatch(setShowPlayersInRoom(false))} 
            onTouchStart={() => dispatch(setShowPlayersInRoom(false))}/>
        </div>
        <div className="w-full p-3">
          <table className="table-fixed rounded-lg w-full">
            <thead>
              <tr className="bg-gray-800">
                <th className={col1Class}>User</th>
                {/* <th className={col2Class}>Seat</th> */}
              </tr>
            </thead>
            <tbody>
              {Object.keys(sockets).map((pid, index) => {
                const playerId = sockets[pid];
                return(
                  <tr key={index} className={"bg-gray-500"}>
                    <td className="p-1 text-center">{playerId ? <UserName userID={playerId}/> : "Anonymous"}</td>
                    {/* <td className="p-1 text-center">Spectator</td> */}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Draggable>
  )
})