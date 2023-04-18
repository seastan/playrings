import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import store from '../../../store';
import { defaultdict } from '../../definitions/common';
import { setValues } from '../../store/gameUiSlice';
import { useDoActionList } from './useDoActionList';
import { useGameDefinition } from './useGameDefinition';

var delayBroadcast;

export const useAddToken = () => {
    const gameDef = useGameDefinition();  
    const [tokenDict, setTokenDict] = useState(defaultdict({}, 0));
    const doActionList = useDoActionList();
    const dispatch = useDispatch();
    const activeCardId = useSelector(state => state?.playerUi?.activeCardId);
    const currentTokens = useSelector(state => state?.gameUi?.game?.cardById?.[activeCardId]?.tokens);
    console.log("currentTokens", activeCardId, currentTokens)

    const resolveTokenDict = () => {
        for (const [tokenType, value] of Object.entries(tokenDict)) {
            const actionList = [
                ["GAME_INCREASE_VAL", "/$ACTIVE_CARD_PATH/tokens/" + tokenType, value],
                ["GAME_ADD_MESSAGE", "$PLAYER_N", value >= 0 ? " added " : " removed ", 
                    Math.abs(value), " ", gameDef?.tokens?.[tokenType]?.name, " tokens to ", 
                    "$ACTIVE_FACE.name", "."]
            ]
            doActionList(actionList);
        }
    }

    return (tokenType, amount) => {
        tokenDict[tokenType] += amount;
        const newTokenDict = {...tokenDict};
        setTokenDict(defaultdict(newTokenDict, 0));
        if (delayBroadcast) clearTimeout(delayBroadcast);
        delayBroadcast = setTimeout(() => {
            resolveTokenDict(newTokenDict, doActionList);
            setTokenDict(defaultdict({}, 0));
        }, 400);
        const currentVal = currentTokens?.[tokenType] || 0;
        const updates = [["game", "cardById", activeCardId, "tokens", tokenType, currentVal + amount]];
        dispatch(setValues({updates: updates}));
    }
}