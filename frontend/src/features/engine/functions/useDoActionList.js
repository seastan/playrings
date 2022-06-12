import { useContext } from 'react';
import { useSelector } from 'react-redux';
import BroadcastContext from '../../../contexts/BroadcastContext';
import store from '../../../store';
import { flipCard } from '../actionLists/flipCard';
import { useGameDefinition } from './useGameDefinition';

export const useDoActionList = () => {
    const gameDef = useGameDefinition();  
    const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);

    return (actionListName, _options = null) => {
        const state = store.getState();
        var actionList = null;
        if (Object.keys(gameDef.actionLists).includes(actionListName)) {
            actionList = gameDef.actionLists[actionListName]
        } else if (actionListName === "flipCard") {
            actionList = flipCard;
        }
        if (actionList != null) gameBroadcast("game_action", {
            action: "game_action_list", 
            options: {
                action_list: actionList, 
                player_ui: state.playerUi,
            }
        })
    }
}