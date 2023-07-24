import { useGameDefinition } from './useGameDefinition';
import { useDoActionList } from './useDoActionList';

export const useLoadPrebuiltDeck = () => {
    const gameDef = useGameDefinition();
    const doActionList = useDoActionList();

    return (deckId) => {
        const deck = gameDef.preBuiltDecks[deckId];
        if (deck) {
            doActionList(["LOAD_CARDS", deckId])
        } else {
            alert("Deck not found");
        }
    }

};