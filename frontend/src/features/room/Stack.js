import React, { useState, useEffect } from "react";
import { Draggable } from "react-beautiful-dnd";
//import cx from "classnames";
import {CARDSCALE, Card} from "./Card";

// const handleDoubleClick = (event, ) {

// }
//                                     () => {
//                                     group.stacks[stackIndex].cards[cardIndex].rotation = card.rotation+90;
//                                     setGroup({...group});
//                                   }}

export const Stack = ({
    inputStack,
    stackIndex,
    broadcast
  }) => {
    const [stack, setStack] = useState(inputStack);
    if (!stack) return null;

    //console.log(stack.id);
    return (
        <Draggable
            key={stack.id}
            draggableId={stack.id}
            index={stackIndex}
        >
        {(provided, snapshot) => {
            if (stack.cards.length === 0) return;
            const stackWidth = CARDSCALE/0.75 + CARDSCALE/3*(stack.cards.length-1)
            return (
            <div
                className=""
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={{
                position: "relative",
                userSelect: "none",
                padding: 0,
                margin: "4px 4px 0 0",
                minHeight: "full",
                ...provided.draggableProps.style,
                minWidth: `${stackWidth}vw`,
                width: `${stackWidth}vw`, //  `${CARDSCALE+CARDSCALE/3*(stack.cards.length-1)}vw`,
                height: `100%`
                }}
            >
                {stack.cards.map((card, cardIndex) => {
                    return(<Card key={card.id} inputCard={card} cardIndex={cardIndex} broadcast={broadcast}></Card>)
                })}
            </div>
            );
        }}
        </Draggable>
    );
  }
  
  export default Stack;