import { useImportLoadList } from './useImportLoadList';
import { useGameDefinition } from './useGameDefinition';
import { useDoActionList } from './useDoActionList';

export const useLoadPrebuiltDeck = () => {
    const importLoadList = useImportLoadList();
    const gameDef = useGameDefinition();
    const doActionList = useDoActionList();

    return (deckId) => {
        const deck = gameDef.preBuiltDecks[deckId];
        if (deck) {
            if (deck.preLoadActionList) doActionList(deck.preLoadActionList);
            importLoadList(deck.cards);
            if (deck.postLoadActionList) doActionList(deck.postLoadActionList);
        } else {
            alert("Deck not found");
        }
    }

};