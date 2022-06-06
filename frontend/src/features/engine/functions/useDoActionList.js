import { useContext } from 'react';
import { useSelector } from 'react-redux';
import BroadcastContext from '../../../contexts/BroadcastContext';
import store from '../../../store';
import { flipCard } from '../actionLists/flipCard';
import { useGameDefinition } from './useGameDefinition';

export const useDoActionList = () => {
    const gameDef = useGameDefinition();  
    const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);

    return (actionName, _options = null) => {
        const state = store.getState();
        var actionList = null;
        if (Object.keys(gameDef.actions).includes(actionName)) {
            actionList = gameDef.actions[actionName]
        } else if (actionName === "flipCard") {
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