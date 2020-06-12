import React, { useState, useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Constants } from "../../game_constants";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Chat from "../chat/Chat";
import uuid from "uuid/v4";
import cx from "classnames";
import { callbackify } from "util";
import { roundToNearestMinutesWithOptions } from "date-fns/fp";

const CARDSCALE = 4.5;

export const Group = ({
  group,
  broadcast,
  showTitle,
}) => {
  const groupID = group.id
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
            {group.name}
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
          direction={(group.type == "discard" || group.type == "deck") ? "vertical" : "horizontal"}
          isCombineEnabled={(group.type == "play") ? true : false}
        >
          {(provided, snapshot) => {
            return (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={cx({
                  //"h-full": true,
                  "flex": (group.type == "hand" || group.type == "play"),
                })}
                style={{
                  borderStyle: snapshot.isDraggingOver
                    ? "dashed"
                    : "none",
                  borderWidth: 2,
                  padding: 0,
                  margin: 0,
                  overflowX: (group.type == "discard" || group.type == "deck") ? "hidden" : "auto",
                  overflowY: (group.type == "discard" || group.type == "deck") ? "auto" : "hidden",
                  width: "calc(100% - 30px)", //(group.type == "hand" || group.type == "play") ? "calc(100% - 30px)" : "100%",
                  height: "95%",
                  //minHeight: "full",
                }}
                
              >
                {group.stacks.map((stack, index) => {
                  //if ((group.type=="deck" || group.type=="discard") && index>0) return null;
                  return (
                    <Draggable
                      key={stack.id}
                      draggableId={stack.id}
                      index={index}
                    >
                      {(provided, snapshot) => {
                        if (stack.cards.length == 0) return;
                        // Determine width of the stack, which is dependent on the orientation of the last card in the stack.
                        const lastCard = stack.cards[stack.cards.length - 1];                             
                        var widthOfLastCard = CARDSCALE;
                        if (lastCard.rotation == 90 || lastCard.rotation == 270) {
                          widthOfLastCard = CARDSCALE/lastCard.aspectRatio;
                        } else if (lastCard.rotation == 0 || lastCard.rotation == 180) {
                          widthOfLastCard = CARDSCALE*lastCard.aspectRatio;
                        }
                        console.log(CARDSCALE);
                        console.log(lastCard.aspectRatio);
                        console.log(CARDSCALE/lastCard.aspectRatio);
                        const stackWidth = widthOfLastCard + CARDSCALE/3*(stack.cards.length-1)
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
                              //height: "180px", //120,
                              //paddingRight: "7%",
                              minWidth: `${stackWidth}vw`,
                              width: `${stackWidth}vw`, //  `${CARDSCALE+CARDSCALE/3*(stack.cards.length-1)}vw`,
                              height: `100%`
                            }}
                          >
                            {stack.cards.map((card, cindex) => {
                              return(
                                <div 
                                  style={{
                                    position: "absolute",
                                    background: `url(${card.src}) no-repeat`,
                                    backgroundSize: "contain",
                                    height: `${CARDSCALE/0.7}vw`,
                                    width: `${CARDSCALE}vw`,
                                    left: `${CARDSCALE/3*cindex}vw`,
                                    transform: `rotate(${card.rotation}deg)`,
                                    zIndex: 1e5-cindex,
                                  }}
                                  onClick={() => console.log(card.id)}
                                >

                                </div>
                              )
                            })}


                          </div>
                        );
                      }}
                    </Draggable>
                  );
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