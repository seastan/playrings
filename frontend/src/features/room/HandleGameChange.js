import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useActiveCard, useSetActiveCard } from "../../contexts/ActiveCardContext";
import { groupAction } from "./Actions";
import { useKeypress, useSetKeypress } from "../../contexts/KeypressContext";
import { useSetObservingPlayerN } from "../../contexts/ObservingPlayerNContext";
import { getQuestNameFromModeAndId } from "./SpawnQuestModal";

export const HandleGameChange = React.memo(({
    playerN,
    typing,
    gameBroadcast, 
    chatBroadcast
}) => {
    const gameUiStore = state => state?.gameUi;
    const gameUi = useSelector(gameUiStore);
    const game = gameUi?.game;
    const questModeAndId = game?.options?.questModeAndId;
    const [prevQuestModeAndId, setPrevQuestModeAndId] = useState(questModeAndId);
    const dispatch = useDispatch();
    const keypress = useKeypress();
    const setKeypress = useSetKeypress();
    const setObservingPlayerN = useSetObservingPlayerN();
    const activeCardAndLoc = useActiveCard();
    const setActiveCardAndLoc = useSetActiveCard();

    const actionProps = {gameUi, playerN, gameBroadcast, chatBroadcast, activeCardAndLoc, setActiveCardAndLoc, dispatch, keypress, setKeypress, setObservingPlayerN};

    // useEffect(() => {
    //     //processGameChange(prevGame, game, actionProps);
    // }, [game]);

    useEffect(() => {
        if (questModeAndId === prevQuestModeAndId) return;
        else setPrevQuestModeAndId(questModeAndId);
        const questName = getQuestNameFromModeAndId(questModeAndId);
        if (questName === "The Fortress of Nurn") {
            const result = window.confirm("Perform automated setup for this quest? (Make sure all player decks are loaded first, and all mulligans have been taken.)")
            if (!result) return;
            for (var i=1; i<=game.numPlayers; i++) {
                const playerI = "player"+i;
                const newActionProps = {...actionProps, playerN: playerI}
                const options = {value: 8, destGroupId: playerI+"Engaged"}
                for (var j=0; j<5; j++) {
                    groupAction("dealX", playerI+"Deck", options, newActionProps);
                }
            }
            const eDeck2StackIds = game.groupById["sharedEncounterDeck2"].stackIds;
            for (var i=0; i<4; i++) {
                gameBroadcast("game_action", {action: "move_stack", options: {stack_id: eDeck2StackIds[i], dest_group_id: "sharedStaging", dest_stack_index: i+1, combine: true, preserve_state: false}})
            }
        }
    }, [questModeAndId]);

    return (null);

})


