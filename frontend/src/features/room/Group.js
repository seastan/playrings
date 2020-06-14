import React, { useState, useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Constants } from "../../game_constants";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Chat from "../chat/Chat";
import uuid from "uuid/v4";
import cx from "classnames";
import { Stack } from "./Stack"
import { callbackify } from "util";
import { roundToNearestMinutesWithOptions } from "date-fns/fp";

const CARDSCALE = 4.5;


const toggleExhaust = (group, setGroup, stackIndex, cardIndex, broadcast) => {
  var card = group.stacks[stackIndex].cards[cardIndex];
  if (card.exhausted) {
    console.log("Readying card");
    card.exhausted = false;
    card.rotation = 0;
  }
  else {
    console.log("Exhausting card");
    card.exhausted = true;
    card.rotation = 90;
  }
  group.stacks[stackIndex].cards[cardIndex] = card;
  setGroup(group);
  //console.log(group);
  //broadcast("update_group",group);
}



export const Group = ({
  inputGroup,
  broadcast,
  showTitle,
}) => {
  const [group, setGroup] = useState(inputGroup);
  const groupID = inputGroup.id
  const [angles, setAngles] = useState(0);

  // useEffect(() => {    
  //   setGroup(inputGroup);
  // }, [inputGroup]);

  return (
    <div className="h-full w-full" 
      key={groupID}
    >
      <div className="text-center p-1 select-none text-white" 
        style={{
          float: "left",
          width:"30px", 
          writingMode:"vertical-rl", 
          display: (showTitle == "false" ? "none" : "block")
          }}>
            {inputGroup.name}
      </div>
      <div className="w-full h-full" 
        style={{
          marginTop: "4px"
          //backgroundColor:"red",
          //overflowX: (group.type == "discard" || group.type == "deck") ? "hidden" : "scroll",
        }}
        >
      
      {/* <div style={{
          margin: "0 0 0 -7px", 
          overflowX: "scroll",
          width: "30px",
        }}> */}
        {/* <Droppable droppableId={groupID} key={groupID} direction="horizontal" isCombineEnabled></Droppable> */}
        <Droppable 
          droppableId={groupID} 
          key={groupID}
          direction={(inputGroup.type == "discard" || inputGroup.type == "deck") ? "vertical" : "horizontal"}
          isCombineEnabled={(inputGroup.type == "play") ? true : false}
        >
          {(provided, snapshot) => {
            return (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={cx({
                  //"h-full": true,
                  "flex": (inputGroup.type == "hand" || inputGroup.type == "play"),
                })}
                style={{
                  //borderStyle: "line",
                  //borderColor: snapshot.isDraggingOver
                  //? "rgba(255,255,255,0.3)"
                  //: "rgba(255,255,255,0)",
                  //borderWidth: 2,
                  backgroundColor: snapshot.isDraggingOver
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0)",
                  padding: 0,
                  margin: 0,
                  overflowX: (inputGroup.type == "discard" || inputGroup.type == "deck") ? "hidden" : "auto",
                  overflowY: (inputGroup.type == "discard" || inputGroup.type == "deck") ? "auto" : "hidden",
                  width: "calc(100% - 30px)", //(group.type == "hand" || group.type == "play") ? "calc(100% - 30px)" : "100%",
                  height: "95%",
                  //minHeight: "full",
                }}
                
              >
                {inputGroup.stacks.map((stack, stackIndex) => {
                  return(<Stack key={stack.id} inputStack={stack} stackIndex={stackIndex} broadcast={broadcast}></Stack>)
                  //if ((group.type=="deck" || group.type=="discard") && index>0) return null;
                  // return (
                  //   <Draggable
                  //     key={stack.id}
                  //     draggableId={stack.id}
                  //     index={stackIndex}
                  //   >
                  //     {(provided, snapshot) => {
                  //       if (stack.cards.length == 0) return;
                  //       // Determine width of the stack, which is dependent on the orientation of the last card in the stack.
                  //       const lastCard = stack.cards[stack.cards.length - 1];                             
                  //       var widthOfLastCard = CARDSCALE;
                  //       if (lastCard.rotation == 90 || lastCard.rotation == 270) {
                  //         widthOfLastCard = CARDSCALE/lastCard.aspectRatio;
                  //       } else if (lastCard.rotation == 0 || lastCard.rotation == 180) {
                  //         widthOfLastCard = CARDSCALE*lastCard.aspectRatio;
                  //       }
                  //       const stackWidth = widthOfLastCard + CARDSCALE/3*(stack.cards.length-1)
                  //       return (
                  //         <div
                  //           className=""
                  //           ref={provided.innerRef}
                  //           {...provided.draggableProps}
                  //           {...provided.dragHandleProps}
                  //           style={{
                  //             position: "relative",
                  //             userSelect: "none",
                  //             padding: 0,
                  //             margin: "4px 4px 0 0",
                  //             minHeight: "full",
                  //             ...provided.draggableProps.style,
                  //             //height: "180px", //120,
                  //             //paddingRight: "7%",
                  //             minWidth: `${stackWidth}vw`,
                  //             width: `${stackWidth}vw`, //  `${CARDSCALE+CARDSCALE/3*(stack.cards.length-1)}vw`,
                  //             height: `100%`
                  //           }}
                  //         >
                  //           {stack.cards.map((card, cardIndex) => {
                  //             return(
                  //               <div 
                  //                 style={{
                  //                   position: "absolute",
                  //                   background: `url(${card.src}) no-repeat`,
                  //                   backgroundSize: "contain",
                  //                   height: `${CARDSCALE/0.7}vw`,
                  //                   width: `${CARDSCALE}vw`,
                  //                   left: `${CARDSCALE/3*cardIndex}vw`,
                  //                   transform: `rotate(${angles}deg)`,
                  //                   //transform: `rotate(${card.rotation}deg)`,
                  //                   zIndex: 1e5-cardIndex,
                  //                   WebkitTransitionDuration: "0.2s",
                  //                   MozTransitionDuration: "0.2s",
                  //                   OTransitionDuration: "0.2s",
                  //                   transitionDuration: "0.2s",
                  //                   WebkitTransitionProperty: "-webkit-transform",
                  //                   MozTransitionProperty: "-moz-transform",
                  //                   OTransitionProperty: "-o-transform",
                  //                   transitionProperty: "transform",
                  //                 }}
                  //                 //  onDoubleClick={() => broadcast("toggle_exhaust",{group, stack, card})}
                  //                 //onDoubleClick={() => toggleExhaust(inputGroup, setGroup, stackIndex, cardIndex, broadcast)}
                  //                 onDoubleClick={() => setAngles(angles+90)}
                  //               >

                  //               </div>
                  //             )
                  //           })}


                  //         </div>
                  //       );
                  //     }}
                  //   </Draggable>
                  // );
                })}
                {provided.placeholder}
              </div>
            );
          }}
        </Droppable>           
      </div>

    </div>
  );
}

export default Group;
/*  */