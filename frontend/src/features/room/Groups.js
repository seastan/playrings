import React, { useState, useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Constants } from "../../game_constants";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Chat from "../chat/Chat";
import Group from "./Group";
import Card from "./Card";
import uuid from "uuid/v4";
import cx from "classnames";

const onDragEnd = (result, groups, setGroups, broadcast) => {
  console.log(result);
  if (!result.destination) return;
  const { source, destination } = result;
  var newGroups = {};
  if (source.droppableId !== destination.droppableId) {
    const sourceGroup = groups[source.droppableId];
    const destGroup = groups[destination.droppableId];
    const sourceStacks = [...sourceGroup.stacks];
    const destStacks = [...destGroup.stacks];
    const [removed] = sourceStacks.splice(source.index, 1);
    destStacks.splice(destination.index, 0, removed);
    newGroups = {
      ...groups,
      [source.droppableId]: {
        ...sourceGroup,
        stacks: sourceStacks
      },
      [destination.droppableId]: {
        ...destGroup,
        stacks: destStacks
      }
    }
  } else {
    const group = groups[source.droppableId];
    const copiedStacks = [...group.stacks];
    const [removed] = copiedStacks.splice(source.index, 1);
    copiedStacks.splice(destination.index, 0, removed);
    newGroups = {
      ...groups,
      [source.droppableId]: {
        ...group,
        stacks: copiedStacks
      }
    }
  }
  setGroups(newGroups);
  broadcast("update_groups",{groups: newGroups});
};

export const Groups = ({
  gameUIView,
  broadcast,
}) => {
  const [groups, setGroups] = useState(gameUIView.game_ui.game.groups);
  const [showScratch, setShowScratch] = useState(false);
  const [phase, setPhase] = useState(1);
  const [activeCard, setActiveCard] = useState(null);

  function toggleScratch() {
    if (showScratch) setShowScratch(false);
    else setShowScratch(true);
  }

  function changePhase(num) {
    if (num!=phase) setPhase(num);
  }

  useEffect(() => {    
    setGroups(gameUIView.game_ui.game.groups);
  }, [gameUIView.game_ui.game.groups]);

  return (
    <DragDropContext
      onDragEnd={result => onDragEnd(result, groups, setGroups, broadcast)}
    >

    <div className="flex flex-1 h-full">
      {/* Right panel */}
      <div className="flex flex-col w-8">
        <div 
          className={`flex flex-col flex-1 text-center p-1 select-none ${(phase==7) ? "bg-gray-600" : "bg-gray-400"}`}
          style={{writingMode:"vertical-rl"}} 
          onClick={() => changePhase(7)}>Refresh</div>
        <div 
          className={`flex flex-col flex-1 text-center p-1 select-none ${(phase==6) ? "bg-gray-600" : "bg-gray-400"}`}
          style={{writingMode:"vertical-rl"}} 
          onClick={() => changePhase(6)}>Combat</div>
        <div 
          className={`flex flex-col flex-1 text-center p-1 select-none ${(phase==5) ? "bg-gray-600" : "bg-gray-400"}`}
          style={{writingMode:"vertical-rl"}} 
          onClick={() => changePhase(5)}>Encounter</div>
        <div 
          className={`flex flex-col flex-1 text-center p-1 select-none ${(phase==4) ? "bg-gray-600" : "bg-gray-400"}`}
          style={{writingMode:"vertical-rl"}} 
          onClick={() => changePhase(4)}>Travel</div>
        <div 
          className={`flex flex-col flex-1 text-center p-1 select-none ${(phase==3) ? "bg-gray-600" : "bg-gray-400"}`}
          style={{writingMode:"vertical-rl"}} 
          onClick={() => changePhase(3)}>Quest</div>
        <div 
          className={`flex flex-col flex-1 text-center p-1 select-none ${(phase==2) ? "bg-gray-600" : "bg-gray-400"}`}
          style={{writingMode:"vertical-rl"}} 
          onClick={() => changePhase(2)}>Planning</div>
        <div 
          className={`flex flex-col flex-1 text-center p-1 select-none ${(phase==1) ? "bg-gray-600" : "bg-gray-400"}`}
          style={{writingMode:"vertical-rl"}} 
          onClick={() => changePhase(1)}>Resource</div>
      </div>



      {/* Middle panel */}
      <div className="flex w-4/5">
        <div className="flex flex-col w-full h-full">
          <div className="bg-gray-200" style={{height: "3%"}}>
            <select name="num_players" id="num_players">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
            player(s)
          </div>
          <div className="f"  style={{height: "94%"}}>

            <div className="w-full" style={{minHeight: "20%", height: "20%", maxHeight: "20%"}}>
              <div className="float-left h-full" style={{width: "10%"}}>
                <Group inputGroup={groups['gSharedEncounterDiscard']} broadcast={broadcast} activeCard={activeCard} setActiveCard={setActiveCard}></Group>
              </div>
              <div className="float-left h-full" style={{width: "10%"}}>
                <Group inputGroup={groups['gSharedEncounterDeck']} broadcast={broadcast} activeCard={activeCard} setActiveCard={setActiveCard}></Group>
              </div>
              <div className="float-left h-full" style={{width: "55%"}}>
                <Group inputGroup={groups['gSharedStaging']} broadcast={broadcast} activeCard={activeCard} setActiveCard={setActiveCard}></Group>
              </div>
              <div className="float-left h-full" style={{width: "10%"}}>
                <Group inputGroup={groups['gSharedActive']} broadcast={broadcast} activeCard={activeCard} setActiveCard={setActiveCard}></Group>
              </div>
              <div className="float-left h-full" style={{width: "15%"}}>
                <Group inputGroup={groups['gSharedMainQuest']} broadcast={broadcast} activeCard={activeCard} setActiveCard={setActiveCard}></Group>
              </div>
              
            </div> 
            <div className="w-full" style={{minHeight: "20%", height: "20%", maxHeight: "20%"}}>
              <Group inputGroup={groups['gPlayer1Engaged']} broadcast={broadcast} activeCard={activeCard} setActiveCard={setActiveCard}></Group>
            </div>
              
            <div className="flex flex-1" style={{minHeight: "20%", height: "20%", maxHeight: "20%"}}>
              <Group inputGroup={groups['gPlayer1Play1']} broadcast={broadcast} activeCard={activeCard} setActiveCard={setActiveCard}></Group>
            </div>
            <div className="flex flex-1" style={{minHeight: "20%", height: "20%", maxHeight: "20%"}}>
              <div className="" style={{width: "90%"}}>
                <Group inputGroup={groups['gPlayer1Play2']} showTitle="false" broadcast={broadcast} activeCard={activeCard} setActiveCard={setActiveCard}></Group>
              </div>
              <div className="" style={{width: "10%"}}>
                <Group inputGroup={groups['gPlayer1Event']} broadcast={broadcast} activeCard={activeCard} setActiveCard={setActiveCard}></Group>
              </div>
            </div>
            <div className=" flex flex-1" style={{minHeight: "20%", height: "20%", maxHeight: "20%", background: "rgba(0, 0, 0, 0.5)"}}>
              <div className="" style={{width: "80%"}}>
                <Group inputGroup={groups['gPlayer1Hand']} broadcast={broadcast} activeCard={activeCard} setActiveCard={setActiveCard}></Group>
              </div>
              <div className="" style={{width: "10%"}}>
                <Group inputGroup={groups['gPlayer1Deck']} broadcast={broadcast} activeCard={activeCard} setActiveCard={setActiveCard}></Group>
              </div>
              <div className="" style={{width: "10%"}}>
                <Group inputGroup={groups['gPlayer1Discard']} broadcast={broadcast} activeCard={activeCard} setActiveCard={setActiveCard}></Group>
              </div>
            </div>
          </div>
          <div className="bg-gray-300" style={{height: "3%"}}>
            Social links
          </div>
        </div>
      </div>
      
      {/* Right panel */}
      <div className="flex w-1/5" >
        <div className="flex flex-col w-full h-full">
          {/* Hovercard */}
          <div className="" 
            style={{
              height: "45%",
              backgroundImage: `url(${activeCard?.src})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              backgroundPosition: "center",
            }}
          >
          </div>
          {/* Chat */}
          <div 
            className="overflow-hidden" 
            style={{height: showScratch ? "12%" : "57%", opacity: 0.7}}
          >
            {gameUIView != null && (
              <Chat roomName={gameUIView.game_ui.game_name} />
            )}
          </div>
          {/* Extra */}
          <div 
            className="bg-gray-800" 
            style={{
              height: "40%", 
              display: showScratch ? "block" : "none"
            }}
          >        
            <div className="bg-gray-300" style={{height: "33.3%"}}>
              <Group inputGroup={groups['gSharedExtra1']} showTitle="false" activeCard={activeCard} setActiveCard={setActiveCard}></Group>
            </div>
            <div className="bg-gray-400" style={{height: "33.3%"}}>
              <Group inputGroup={groups['gSharedExtra2']} showTitle="false" activeCard={activeCard} setActiveCard={setActiveCard}></Group></div>
            <div className="" style={{height: "33.4%"}}>
              <Group inputGroup={groups['gSharedExtra3']} showTitle="false" activeCard={activeCard} setActiveCard={setActiveCard}></Group></div>
          </div>
          <div className="text-center" onClick={() => toggleScratch()} style={{height: "3%"}}>
            <FontAwesomeIcon className="text-white" icon={showScratch ? faChevronDown : faChevronUp}/>
          </div>
        </div>
      </div>
    </div>

    </DragDropContext>


    // <div 
    //   style={{ justifyContent: "center", height: "100%" }}>
    //   <DragDropContext
    //     onDragEnd={result => onDragEnd(result, groups, setGroups, broadcast)}
    //   >
    //     {Object.entries(groups).map(([groupID, group], index) => {
    //       //if (index>1) return ( <div></div> );
    //       return (
    //         <div
    //           style={{
    //             display: "flex",
    //             flexDirection: "column",
    //             alignItems: "center"
    //           }}
    //           key={groupID}
    //         >
    //           <h2>{group.controller+' '+group.name}</h2>
    //           <div style={{
    //               margin: 8, 
    //               display: "flex",
    //               width: 86
    //             }}>
    //             <Droppable droppableId={groupID} key={groupID} direction="horizontal" isCombineEnabled>
    //               {(provided, snapshot) => {
    //                 return (
    //                   <div
    //                     {...provided.droppableProps}
    //                     ref={provided.innerRef}
    //                     style={{
    //                       background: snapshot.isDraggingOver
    //                         ? "lightblue"
    //                         : "lightgrey",
    //                       padding: 0,
    //                       display: "flex",
    //                       flexGrow: 1,
    //                       height: 120,
    //                       overflowX: (group.type == "discard" || group.type == "deck") ? "hidden" : "scroll",
    //                       overflowY: "hidden"
    //                     }}
                        
    //                   >
    //                     {group.cards.map((card, index) => {
    //                       if ((group.type=="deck" || group.type=="discard") && index>0) return null;
    //                       return (
    //                         <Draggable
    //                           key={groupID+' '+card.id}
    //                           draggableId={groupID+' '+card.id}
    //                           index={index}
    //                         >
    //                           {(provided, snapshot) => {
    //                             // if(snapshot.isDragging) {
    //                             //   let regex = new RegExp('translate\\((.*?)px, (.*?)px\\)');
    //                             //   let transform = regex.exec(provided.draggableProps.style.transform || "");
    //                             //   //if both the parent (the nested list) and the child (item beeing dragged) has transform values, recalculate the child items transform to account for position fixed not working
    //                             //   if(transform != null) {
    //                             //     let x = (parseFloat(transform[1], 10));
    //                             //     let y = (parseFloat(transform[2], 10));
    //                             //     console.log(x,y);
    //                             //     deltaXY = {x,y};
    //                             //   }
    //                             // }
    //                             //console.log('transform');
    //                             //console.log(transform);
    //                             return (
    //                               <div
    //                                 ref={provided.innerRef}
    //                                 {...provided.draggableProps}
    //                                 {...provided.dragHandleProps}
    //                                 style={{
    //                                   userSelect: "none",
    //                                   padding: 0,
    //                                   margin: "0 0 0 0",
    //                                   minHeight: "50px",
    //                                   background: `url(${card.src}) no-repeat center center / 100%`,
    //                                   backgroundColor: snapshot.isDragging
    //                                     ? "#263B4A"
    //                                     : "#456C86",
    //                                   color: "white",
    //                                   ...provided.draggableProps.style,
    //                                   height: 120,
    //                                   width: 86,
    //                                   minWidth: 86
    //                                 }}
    //                               >
    //                                 CARD{card.name}
    //                               </div>
    //                             );
    //                           }}
    //                         </Draggable>
    //                       );
    //                     })}
    //                     {provided.placeholder}
    //                   </div>
    //                 );
    //               }}
    //             </Droppable>



    //           </div>
    //         </div>
    //       );
    //     })}


    //   </DragDropContext>
    // </div>
  );
}

export default Groups;
