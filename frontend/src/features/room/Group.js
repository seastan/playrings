import React, { useState, useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Constants } from "../../game_constants";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Chat from "../chat/Chat";
import uuid from "uuid/v4";
import cx from "classnames";
import { callbackify } from "util";



export const Group = ({
  group,
  showTitle,
}) => {
  const groupID = group.id
  console.log("gid");
  console.log(groupID);
  return (
    <div className="flex flex-1 h-full w-full" 
      key={groupID}
    >
      <div className="text-center p-1 select-none" 
        style={{
          width:"30px", 
          writingMode:"vertical-rl", 
          display: (showTitle == "false" ? "none" : "block")
          }}>
            {group.name}
      </div>
      <div className="w-full h-full" 
        style={{
          backgroundColor:"red",
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
                  "h-full m-2": true,
                  "flex": (group.type == "hand" || group.type == "play"),
                })}
                style={{
                  background: snapshot.isDraggingOver
                    ? "lightblue"
                    : "lightgrey",
                  padding: 0,
                  margin: 0,
                  overflowX: (group.type == "discard" || group.type == "deck") ? "hidden" : "scroll",
                  overflowY: (group.type == "discard" || group.type == "deck") ? "scroll" : "hidden",
                  width: "100%", //(group.type == "hand" || group.type == "play") ? "calc(100%)" : "100%",
                  //height: "full",
                  //minHeight: "full",
                }}
                
              >
                {group.cards.map((card, index) => {
                  //if ((group.type=="deck" || group.type=="discard") && index>0) return null;
                  return (
                    <Draggable
                      key={groupID+' '+card.id}
                      draggableId={groupID+' '+card.id}
                      index={index}
                    >
                      {(provided, snapshot) => {
                        return (
                          <div
                            className=""
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              userSelect: "none",
                              padding: 0,
                              margin: "4px 4px 0 0",
                              minHeight: "full",
                              background: `url(${card.src}) no-repeat`,
                              backgroundSize: "contain",
                              backgroundColor: snapshot.isDragging
                                ? "red"
                                : "#456C86",
                              color: "white",
                              ...provided.draggableProps.style,
                              //height: "180px", //120,
                              //paddingRight: "7%",
                              minWidth: "4.5vw",
                              width: "4.5vw",
                              height: "6.4vw"
                            }}
                          >
                            
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