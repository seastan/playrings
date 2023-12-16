import store from '../../../store';
import { evaluate } from './evaluate';
import { useGameDefinition } from './useGameDefinition';

export const useGetDefaultAction = () => {
  const gameDef = useGameDefinition();
  const defaultActions = gameDef?.defaultActions;
  if (!defaultActions) return () => null;
  return ((cardId) => {
    const state = store.getState();
    const card = state?.gameUi?.game?.cardById[cardId];
    for (var defaultAction of defaultActions) {
      console.log("equal condition", defaultAction.condition, evaluate(state, card, defaultAction.condition))
      if (evaluate(state, card, defaultAction.condition)) return defaultAction; 
    }
    return null;
  })
}
