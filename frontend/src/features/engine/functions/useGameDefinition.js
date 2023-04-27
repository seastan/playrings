import { useSelector } from 'react-redux';
import { usePlugin } from './usePlugin';

export const useGameDefinition = () => {
    const plugin = usePlugin();
    return plugin?.gameDef; //useSelector(state => state?.gameUi?.game?.gameDef);
}