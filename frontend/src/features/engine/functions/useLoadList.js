import { useContext } from 'react';
import { useSelector } from 'react-redux';
import BroadcastContext from '../../../contexts/BroadcastContext';
import { usePlugin } from './usePlugin';

export const useLoadList = () => {
    const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
    const cardDb = usePlugin()?.card_db;
    return (list) => {
        console.log("loadlist1", list)
        const newList = [];
        for (var item of list) {
            newList.push({...item, cardDetails: cardDb[item.uuid]})
        }
        console.log("loadlist2", newList)
        gameBroadcast("game_action", {action: "load_cards", options: {load_list: newList}});
    }
}