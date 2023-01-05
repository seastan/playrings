import React, { useContext } from "react";
import { faRedoAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import store from "../../store";
import { useDispatch } from "react-redux";
import BroadcastContext from "../../contexts/BroadcastContext";
import { useDoActionList } from "./functions/useDoActionList";

export const SideBarNewRound = React.memo(() => {
    const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
    const dispatch = useDispatch();
    const doActionList = useDoActionList()
    const handleClick = () => {
        const state = store.getState();
        const actionProps = {state, dispatch, gameBroadcast, chatBroadcast};
        doActionList("newRound");
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


