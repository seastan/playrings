import { useContext } from 'react';
import { useSelector } from 'react-redux';
import BroadcastContext from '../../../contexts/BroadcastContext';
import store from '../../../store';
import { flipCard } from '../actionLists/flipCard';
import { useGameDefinition } from './useGameDefinition';

export const useDoActionList = () => {
    const gameDef = useGameDefinition();  
    const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
    console.log("gameb render usedoaction 1", gameBroadcast)
    return (actionListId, actionList = null, _options = null) => {
        const state = store.getState();
        if (Object.keys(gameDef.actionLists).includes(actionListId)) {
            actionList = gameDef.actionLists[actionListId]
        }
        console.log("actionlistprint", actionList)
        if (actionList != null) {
            console.log("game_action", gameBroadcast)    
            console.log("gameb render usedoaction 2", gameBroadcast)

            gameBroadcast("game_action", {
                action: "evaluate", 
                options: {
                    action_list: actionList, 
                    player_ui: state.playerUi,
                }
            })
        }
    }
}