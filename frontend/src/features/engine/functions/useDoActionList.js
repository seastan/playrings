import { useContext } from 'react';
import { useSelector } from 'react-redux';
import BroadcastContext from '../../../contexts/BroadcastContext';
import store from '../../../store';
import { flipCard } from '../actionLists/flipCard';
import { useGameDefinition } from './useGameDefinition';

export const useDoActionList = () => {
    const gameDef = useGameDefinition();  
    const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
    return (idOrList) => {
        // This fuction can take either an id for an action list, in which case it
        // executes the corresponding action list in the game definition, or it can
        // take a list, which it interprests as a custom action list and executes it.
        const isList = Array.isArray(idOrList);
        const state = store.getState();
        var actionList = null;
        if (isList) {
            actionList = idOrList;
        } else if (!isList && Object.keys(gameDef.actionLists).includes(idOrList)) {
            actionList = gameDef.actionLists[idOrList]
        }
        if (actionList != null) {
            console.log("handletouch",  actionList)
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