import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import store from '../../../store';
import { defaultdict } from '../functions/common';
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
                ["INCREASE_VAL", "/cardById/$ACTIVE_CARD_ID/tokens/" + tokenType, value],
                ["LOG", "$PLAYER_N", value >= 0 ? " added " : " removed ", 
                    Math.abs(value), " ", gameDef?.tokens?.[tokenType]?.label, " tokens to ", 
                    "$ACTIVE_FACE.name", "."]
            ]
            doActionList(actionList);
        }
    }

    return (tokenType, amount) => {
        const currentVal = currentTokens?.[tokenType] || 0;
        var newVal = currentVal + amount;
        var adjustedAmount = amount;
        if (newVal < 0 && !gameDef?.tokens?.[tokenType]?.canBeNegative) {
            return
        }
        
        tokenDict[tokenType] += adjustedAmount;
        const newTokenDict = {...tokenDict};
        setTokenDict(defaultdict(newTokenDict, 0));
        if (delayBroadcast) clearTimeout(delayBroadcast);
        delayBroadcast = setTimeout(() => {
            resolveTokenDict(newTokenDict, doActionList);
            setTokenDict(defaultdict({}, 0));
        }, 400);
        const updates = [["game", "cardById", activeCardId, "tokens", tokenType, newVal]];
        dispatch(setValues({updates: updates}));
    }
}