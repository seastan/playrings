
import React, { useState, useEffect, useContext } from "react";
import { ArcherContainer } from 'react-archer';
import { DragDropContext } from "react-beautiful-dnd";
import { useSelector, useDispatch } from 'react-redux';
import { setStackIds, setCardIds, setGroupById, setValues } from "./gameUiSlice";
import { reorderGroupStackIds } from "./Reorder";
import { Table } from "./Table";
import { GROUPSINFO } from "./Constants"
import { getDisplayName, getDisplayNameFlipped, getCurrentFace } from "./Helpers"
import { useKeypress } from "../../contexts/KeypressContext";



export const DragContainer = React.memo(({
  playerN,
  gameBroadcast,
  chatBroadcast,
  setTyping
}) => {
  const gameStore = state => state?.gameUi?.game;
  const dispatch = useDispatch();
  const game = useSelector(gameStore);
  const keypress = useKeypress();
  console.log("rendering dragcontainer");

  const onDragEnd = (result) => {
    console.log("drag end ",result);
    const groupById = game.groupById;
    const orig = result.source;
    const origGroupId = orig.droppableId;
    const origGroup = groupById[origGroupId];
    const origGroupStackIds = origGroup.stackIds;
    const origStackId = origGroupStackIds[orig.index];    
    const origStack = game.stackById[origStackId];
    const origStackCardIds = origStack.cardIds;
    const topOfOrigStackCardId = origStackCardIds[0];
    const topOfOrigStackCard = game.cardById[topOfOrigStackCardId];

    // Combine
    if (result.combine) {
      const dest = result.combine;
      const destGroupId = dest.droppableId;
      const destGroup = game["groupById"][destGroupId];
      const destGroupStackIds = groupById[destGroupId].stackIds;

      dest.index = -1;
      for(var i=0; i<=destGroupStackIds.length; i++) {
        if(destGroupStackIds[i] == dest.draggableId){
          dest.index = i;
        }
      }
      if (!dest.index < 0) return;
      const destStackId = destGroupStackIds[dest.index];
      const destStack = game.stackById[destStackId];
      const destStackCardIds = destStack.cardIds;
      const topOfDestStackCardId = destStackCardIds[0];
      const topOfDestStackCard = game.cardById[topOfDestStackCardId];
      const newDestStackCardIds = destStackCardIds.concat(origStackCardIds);

      const newDestStack = {
        ...destStack,
        cardIds: newDestStackCardIds,
      }

      const newOrigGroupStackIds = Array.from(origGroupStackIds);
      newOrigGroupStackIds.splice(orig.index, 1);

      const newOrigGroup = {
        ...origGroup,
        stackIds: newOrigGroupStackIds
      }   
      if (!keypress["Shift"] && (origGroup.type === "hand" || origGroup.type === "deck" ) && (destGroup.type !== "hand" && destGroup.type !== "deck" )) {
        chatBroadcast("game_update",{message: "attached "+getDisplayNameFlipped(topOfOrigStackCard)+" from "+GROUPSINFO[origGroupId].name+" to "+getDisplayName(topOfDestStackCard)+" in "+GROUPSINFO[destGroupId].name+"."})
        // Flip card faceup
        const updates = [["game","cardById",topOfOrigStackCardId,"currentSide", "A"]];
        dispatch(setValues({updates: updates}));
      }
      else {
        chatBroadcast("game_update",{message: "attached "+getDisplayName(topOfOrigStackCard)+" from "+GROUPSINFO[origGroupId].name+" to "+getDisplayName(topOfDestStackCard)+" in "+GROUPSINFO[destGroupId].name+"."});
      }
      dispatch(setStackIds(newOrigGroup));
      dispatch(setCardIds(newDestStack));
      gameBroadcast("game_action", {action:"move_stack", options:{stack_id: origStackId, dest_group_id: destGroupId, dest_stack_index: dest.index, combine: true, preserve_state: keypress["Shift"]}})
      return;
    }

    // Dropped nowhere
    if (!result.destination) {
      return;
    }
    const dest = result.destination;
    const destGroupId = dest.droppableId;
    const destGroup = game["groupById"][destGroupId];

    // Did not move anywhere - can bail early
    if (
      orig.droppableId === dest.droppableId &&
      orig.index === dest.index
    ) {
      return;
    }

    // Moved to a different spot
    const temp = {droppableId: "sharedExtra1"};
    const tempGroupById = reorderGroupStackIds(groupById, orig, temp);
    const newGroupById = reorderGroupStackIds(groupById, orig, dest);
    const origGroupTitle = GROUPSINFO[origGroupId].name;
    const destGroupTitle = GROUPSINFO[destGroupId].name;
    if (!keypress["Shift"] && (origGroup.type === "hand" || origGroup.type === "deck" ) && (destGroup.type !== "hand" && destGroup.type !== "deck" )) {
      chatBroadcast("game_update",{message: "moved "+getDisplayNameFlipped(topOfOrigStackCard)+" from "+origGroupTitle+" to "+destGroupTitle+"."});
      // Flip card faceup
      const updates = [["game","cardById",topOfOrigStackCardId,"currentSide", "A"]];
      dispatch(setValues({updates: updates}));
    }
    else {
      chatBroadcast("game_update",{message: "moved "+getDisplayName(topOfOrigStackCard)+" from "+origGroupTitle+" to "+destGroupTitle+"."});
    }
    //dispatch(setGroupById(tempGroupById));
    //dispatch(setGroupById(newGroupById));

    //const delayBroadcast = setTimeout(function() {
      dispatch(setGroupById(newGroupById));
    //}, 1);

    //gameBroadcast("game_action", {action:"move_stack", options:{stack_id: origStackId, dest_group_id: destGroupId, dest_stack_index: dest.index, combine: false, preserve_state: keypress["Shift"]}})
  }

  return(
    <DragDropContext onDragEnd={onDragEnd}>
      <ArcherContainer 
        className="h-full w-full" 
        strokeColor="rgba(0,0,0,0.5)" 
        strokeWidth="15"
        svgContainerStyle={{ 
          zIndex: 1e5,
        }} 
        endShape={{
          arrow: {
            arrowLength: 2,
            arrowThickness: 2,
          }
        }}>
        <Table
          playerN={playerN}
          gameBroadcast={gameBroadcast}
          chatBroadcast={chatBroadcast}
          setTyping={setTyping}
        />
      </ArcherContainer>
    </DragDropContext>
  )
});