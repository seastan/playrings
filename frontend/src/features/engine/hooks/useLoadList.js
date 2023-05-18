import { useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import BroadcastContext from '../../../contexts/BroadcastContext';
import store from '../../../store';
import { usePlugin } from './usePlugin';

export const useLoadList = () => {
  const { gameBroadcast, chatBroadcast } = useContext(BroadcastContext);
  const playerN = useSelector(state => state?.playerUi?.playerN);
  const plugin = usePlugin();
  const [cardDb, setCardDb] = useState(null);

  useEffect(() => {
    if (plugin && plugin.card_db) {
      setCardDb(plugin.card_db);
    }
  }, [plugin]);

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
      options: { 
        load_list: newList,
        player_ui: store.getState().playerUi
      },
    });
  };

  return loadList;
};