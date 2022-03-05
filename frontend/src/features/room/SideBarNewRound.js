import React from "react";
import { gameAction } from "./Actions";
import { faRedoAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import store from "../../store";
import { useDispatch } from "react-redux";


export const SideBarNewRound = React.memo(({
    gameBroadcast, 
    chatBroadcast
}) => {
    const dispatch = useDispatch();
    const handleClick = () => {
        const state = store.getState();
        const actionProps = {state, dispatch, gameBroadcast, chatBroadcast};
        gameAction("new_round", actionProps);
    }
    return (
        <div 
            className="h-full w-full bg-gray-500 hover:bg-gray-400 flex items-center justify-center text-center" 
            style={{borderBottom: "1px solid white"}}
            onClick={() => handleClick()}
            title="New Round">
        <FontAwesomeIcon 
            className="text-white"
            icon={faRedoAlt}/>
        </div>
    )

})


