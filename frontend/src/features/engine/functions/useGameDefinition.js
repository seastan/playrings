import { useSelector } from 'react-redux';
import { usePlugin } from './usePlugin';

export const useGameDefinition = () => {
    return useSelector(state => state?.gameUi?.gameDef);
}