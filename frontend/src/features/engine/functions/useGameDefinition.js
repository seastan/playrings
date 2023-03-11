import { useSelector } from 'react-redux';

export const useGameDefinition = () => {
    return useSelector(state => state?.gameUi?.game?.gameDef);
}