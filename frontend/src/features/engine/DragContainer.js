
import React from "react";
import { ArrowsBetweenDivsContextProvider, ArrowBetweenDivs, LineOrientation, ArrowAnchorPlacement } from 'react-simple-arrows';
import { DragDropContext } from "react-beautiful-dnd";
import { useSelector, useDispatch } from 'react-redux';
import { setStackIds, setCardIds, setGroupById } from "../store/gameUiSlice";
import { reorderGroupStackIds } from "./Reorder";
import store from "../../store";
import { setDraggingFromGroupId, setTouchAction } from "../store/playerUiSlice";
import { Table } from "./Table";
import { useDoActionList } from "./hooks/useDoActionList";
import { ArcherContainer } from 'react-archer';


export const DragContainer = React.memo(({}) => {
  console.log("Rendering DragContainer");
  const dispatch = useDispatch();
  const doActionList = useDoActionList();
  const keypressShift = useSelector(state => state?.playerUi?.keypress?.Shift);
  const playerData = useSelector(state => state?.gameUi?.game?.playerData);
  const touchMode = useSelector(state => state?.playerUi?.touchMode);
  //const archerContainerRef = React.createRef();
  const arrowColors = ["rgba(255,0,0,0.6)", "rgba(0,200,0,0.6)", "rgba(0,128,255,0.6)", "rgba(128,0,255,0.6)"];

  //const arrows1 = playerData.player1.arrows;
  //const arrows2 = playerData.player2.arrows;
  //const arrows3 = playerData.player3.arrows;
  //const arrows4 = playerData.player4.arrows;
  const usingArrows = false; //(arrows1 && arrows1.length) || (arrows2 && arrows2.length) || (arrows3 && arrows3.length) || (arrows4 && arrows4.length);

  const onBeforeDragStart = (result) => {
    console.log("onBeforeDragStart", result)
    dispatch(setDraggingFromGroupId(result.source.droppableId));
  }


  const onDragEnd = (result) => {
    const game = store.getState()?.gameUi.game;
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
    var destGroup = null;
    dispatch(setDraggingFromGroupId(null));

    // Combine
    if (result.combine) {
      const dest = result.combine;
      const destGroupId = dest.droppableId;
      destGroup = game["groupById"][destGroupId];
      const destGroupStackIds = groupById[destGroupId].stackIds;

      dest.index = -1;
      for(var i=0; i<=destGroupStackIds.length; i++) {
        if(destGroupStackIds[i] === dest.draggableId){
          dest.index = i;
        }
      }
      if (!dest.index < 0) return;
      const destStackId = destGroupStackIds[dest.index];
      const destStack = game.stackById[destStackId];
      const destStackCardIds = destStack.cardIds;
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
      // We could add some logic here to flip the card locally instantly, but there would still be a delay to get load the image
      // const updates = [["cardById",topOfOrigStackCardId,"currentSide", "A"]];
      // dispatch(setValues({updates: updates}));

      dispatch(setStackIds(newOrigGroup));
      dispatch(setCardIds(newDestStack));
      doActionList(["MOVE_STACK", origStackId, destGroupId, dest.index, {"combine": true}])
    }

    // Dropped nowhere
    else if (!result.destination) {
      return;
    } 
    
    // Dragged somewhere
    else {
      const dest = result.destination;
      const destGroupId = dest.droppableId;
      destGroup = game["groupById"][destGroupId];

      // Did not move anywhere - can bail early
      if (
        orig.droppableId === dest.droppableId &&
        orig.index === dest.index
      ) {
        return;
      }
      // Moved to a different spot
      const newGroupById = reorderGroupStackIds(groupById, orig, dest);
      // We could add some logic here to flip the card locally instantly, but there would still be a delay to get load the image
      // const updates = [["game", "cardById", topOfOrigStackCardId, "currentSide", "A"]];
      // dispatch(setValues({updates: updates}));
      doActionList([
        ["LOG", "$PLAYER_N", " moved ", ["FACEUP_NAME_FROM_STACK_ID", origStackId], " from ", "$GAME.groupById."+origGroupId+".label", " to ", "$GAME.groupById."+destGroupId+".label", "."],
        ["MOVE_STACK", origStackId, destGroupId, dest.index]
      ])
      dispatch(setGroupById(newGroupById));
    }

  }

  return(

      <ArcherContainer 
        className="h-full w-full" 
        strokeColor="rgba(255,0,0,0.6)" 
        strokeWidth="15"
        svgContainerStyle={{ 
          zIndex: 1e5,
        }} 
        endShape={{
          arrow: {
            arrowLength: 1,
            arrowThickness: 2,
          }
        }}>
      <DragDropContext onDragEnd={onDragEnd} onBeforeDragStart={onBeforeDragStart}>
        <Table/>
      </DragDropContext>
    </ArcherContainer>
  )
});