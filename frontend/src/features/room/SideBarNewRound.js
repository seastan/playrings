import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useActiveCard, useSetActiveCard } from "../../contexts/ActiveCardContext";
import { gameAction, cardAction } from "./Actions";
import { useKeypress, useSetKeypress } from "../../contexts/KeypressContext";
import { useSetObservingPlayerN } from "../../contexts/ObservingPlayerNContext";
import { faRedoAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";



export const SideBarNewRound = React.memo(({
    playerN,
    gameBroadcast, 
    chatBroadcast
}) => {
    const gameUiStore = state => state?.gameUi;
    const gameUi = useSelector(gameUiStore);
    const dispatch = useDispatch();
    const keypress = useKeypress();
    const setKeypress = useSetKeypress();
    const setObservingPlayerN = useSetObservingPlayerN();

    const activeCardAndLoc = useActiveCard();
    const setActiveCardAndLoc = useSetActiveCard();

    const actionProps = {gameUi, playerN, gameBroadcast, chatBroadcast, activeCardAndLoc, setActiveCardAndLoc, dispatch, keypress, setKeypress, setObservingPlayerN};

    const handleClick = () => {
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


