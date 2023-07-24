import { useImportLoadList } from './useImportLoadList';
import { useGameDefinition } from './useGameDefinition';

export const useLoadPrebuiltDeck = () => {
    const importLoadList = useImportLoadList();
    const gameDef = useGameDefinition();

    return (deckId) => {
        const deck = gameDef.preBuiltDecks[deckId];
        if (deck) {
            importLoadList(deck.cards);
        } else {
            alert("Deck not found");
        }
    }

};