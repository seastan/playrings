import { useContext } from 'react';
import { useSelector } from 'react-redux';
import BroadcastContext from '../../../contexts/BroadcastContext';
import { usePlugin } from './usePlugin';

export const useLoadList = () => {
  const { gameBroadcast, chatBroadcast } = useContext(BroadcastContext);
  const playerN = useSelector(state => state?.playerUi?.playerN);
  const cardDb = usePlugin()?.card_db;

  const loadList = (list) => {
    console.log('loadList', list);

    if (!cardDb) {
      alert('Plugin not fully loaded.');
      return;
    }

    const newList = list.map(item => ({
      ...item,
      cardDetails: cardDb[item.uuid],
      loadGroupId: item.loadGroupId.replace(/playerN/g, playerN),
    }));

    console.log('newList', newList);

    gameBroadcast('game_action', {
      action: 'load_cards',
      options: { load_list: newList },
    });
  };

  return loadList;
};