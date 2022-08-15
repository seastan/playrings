import { useContext } from 'react';
import { useSelector } from 'react-redux';
import BroadcastContext from '../../../contexts/BroadcastContext';
import store from '../../../store';
import { flipCard } from '../actionLists/flipCard';
import { useGameDefinition } from './useGameDefinition';

export const useDoActionList = () => {
    const gameDef = useGameDefinition();  
    const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);

    return (actionListName, actionList = null, _options = null) => {
        const state = store.getState();
        if (Object.keys(gameDef.actionLists).includes(actionListName)) {
            actionList = gameDef.actionLists[actionListName]
        }
        if (actionList != null) gameBroadcast("game_action", {
            action: "evaluate", 
            options: {
                action_list: actionList, 
                player_ui: state.playerUi,
            }
        })
    }
}