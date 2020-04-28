import React, { useState } from "react";
import Draggable from 'react-draggable';
import cx from "classnames";
import { Card } from "elixir-backend";

const suitValues = {
  s: 400,
  h: 300,
  c: 200,
  d: 100,
};

const handSort = (a: Card, b: Card) => {
  const aVal = suitValues[a.suit] + a.rank;
  const bVal = suitValues[b.suit] + b.rank;
  if (aVal < bVal) {
    return -1;
  }
  if (aVal > bVal) {
    return 1;
  }
  return 0;
};

interface Props {
  cards: Array<Card>;
  broadcast: (eventName: string, payload: object) => void;
}

const cardToString = (card: Card) => card.rank.toString() + card.suit;

const minWSix = {
  minWidth: "6rem",
};

export const Hand: React.FC<Props> = ({ cards, broadcast }) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  cards.sort(handSort);

  return (
    <div className="flex justify-center" style={minWSix}>
      {cards.map((card) => {
        let cardStr = cardToString(card);

        return (
          <img
            key={cardStr}
            src={`/images/cards3/${cardStr}.png`}
            alt={cardStr}
            draggable={false}
            unselectable="on"
            className={cx({
              "noselect h-32 object-cover -ml-16 z-30 hand-card-animate": true,
              "-mt-5 mr-5 hand-card-selected": selectedCard === cardStr,
              "hand-card-dragged": draggedCard === cardStr,
            })}
            onClick={() => {
              if (selectedCard === cardStr) {
                // Send play command
                // Display error message only if it's my turn(?)
                broadcast("play", { card });
                setSelectedCard(null);
              } 
            }}            
            onMouseOver={() => {
              if (!draggedCard)
                setSelectedCard(cardStr);
              
              console.log(selectedCard);
              console.log(selectedCard == cardStr);
            }}            
            onMouseLeave={() => {
              setSelectedCard(null);
            }}
            onMouseDown={() => {
              console.log('hello');
            }}            
            onDrag={() => {
              setSelectedCard(cardStr);
              setDraggedCard(cardStr);
            }}
            onDragEnd={() => {
              setDraggedCard(null);
            }}            
          />
        );
      })}
    </div>
  );
};
export default Hand;
