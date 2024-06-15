
import React, { useCallback, useEffect, useState } from "react";
import { DragDropContext } from "@seastan/react-beautiful-dnd";
import { useSelector, useDispatch } from 'react-redux';
import { setStackIds, setCardIds, setGroupById } from "../store/gameUiSlice";
import { getGroupIdAndRegionType, reorderGroupStackIds } from "./Reorder";
import store from "../../store";
import { setDraggingEnd, setDraggingEndDelay, setDraggingStackId, setTempDragStack, setDraggingMouseCurrentX, setDraggingMouseCurrentY, setDraggingMouseDownX, setDraggingMouseDownY, setDraggingStackRectangles, setDraggingGroupRectangle, setDraggingDefault, setDraggingHoverOverStackId, setDraggingHoverOverDirection, setDraggingHoverOverDroppableId, setDraggingFromDroppableId } from "../store/playerUiSlice";
import { Table } from "./Table";
import { useDoActionList } from "./hooks/useDoActionList";
import { ArcherContainer } from 'react-archer';
import { getVisibleFace } from "./functions/common";
import { useGameDefinition } from "./hooks/useGameDefinition";
import { usePlayerN } from "./hooks/usePlayerN";
import { useHoverStackIdAndDirection } from "./hooks/useHoverStackIdAndDirection";
import { useGetRegionFromId } from "./hooks/useGetRegionFromId";

let draggableClientRect = null;

const getAfterDragName = (game, stackId, destGroupId, allowFlip) => {
  const stack = game.stackById[stackId];
  const cardIds = stack.cardIds;
  const cardId = cardIds[0];
  const card = game.cardById[cardId];

  if (!allowFlip) return card?.sides?.[card?.currentSide]?.name;
  
  const destGroup = game.groupById[destGroupId];
  const destGroupCurrentSide = destGroup?.onCardEnter?.currentSide;
  
  if (destGroupCurrentSide) {
    return card?.sides?.[destGroupCurrentSide]?.name;
  }
  return card?.sides?.[card?.currentSide]?.name;
}


export const DragContainer = React.memo(({}) => {
  console.log("Rendering DragContainer");
  const dispatch = useDispatch();
  const gameDef = useGameDefinition();
  const doActionList = useDoActionList();
  const playerN = usePlayerN();
  const [isDragging, setIsDragging] = useState(false);
  const getRegionFromId = useGetRegionFromId();
  //const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  //const [mouseDownPosition, setMouseDownPosition] = useState({ x: 0, y: 0 });
  const hoverStackIdAndDirection = useHoverStackIdAndDirection();

  const updateMousePosition = ev => {
    const draggingStackId = store.getState()?.playerUi?.dragging?.stackId;  
    const hoverOverDroppableId = store.getState()?.playerUi?.dragging?.hoverOverDroppableId;
    const hoverOverRegion = getRegionFromId(hoverOverDroppableId);  
    const draggableNode = document.querySelector(`[data-rbd-draggable-id="${draggingStackId}"]`);
    const draggableRect = draggableNode.getBoundingClientRect();
    draggableRect.stackId = draggingStackId;
    const centerX = draggableRect.left + draggableRect.width / 2;
    const centerY = draggableRect.top + draggableRect.height / 2;

    const stackRectangles = store.getState()?.playerUi?.dragging?.stackRectangles;
    const groupRectangle = store.getState()?.playerUi?.dragging?.groupRectangle;
    const hoverData = hoverStackIdAndDirection(centerX, centerY, draggableRect, stackRectangles, groupRectangle, hoverOverDroppableId);

    if (hoverData.stackId && hoverOverRegion.disableDroppableAttachments !== true) {

      const draggingTopCardId = store.getState()?.gameUi?.game?.stackById[draggingStackId]?.cardIds[0];
      const draggingTopCard = store.getState()?.gameUi?.game?.cardById[draggingTopCardId];
      const draggingTopFace = getVisibleFace(draggingTopCard, playerN);
      const draggingTopCardType = draggingTopFace?.type;
      const hoverOverStackId = hoverData.stackId;
      const canOnlyAttachToTypes = gameDef?.cardTypes?.[draggingTopCardType]?.canOnlyAttachToTypes;

      const hoverOverTopCardId = store.getState()?.gameUi?.game?.stackById[hoverOverStackId]?.cardIds[0];
      const hoverOverTopCard = store.getState()?.gameUi?.game?.cardById[hoverOverTopCardId];
      const hoverOverTopFace = getVisibleFace(hoverOverTopCard, playerN);
      const hoverOverTopCardType = hoverOverTopFace?.type;
      const canOnlyHaveAttachmentsOfTypes = gameDef?.cardTypes?.[hoverOverTopCardType]?.canOnlyHaveAttachmentsOfTypes;
      console.log("hoverData", hoverData, {canOnlyAttachToTypes, canOnlyHaveAttachmentsOfTypes, hoverOverTopCardType, draggingTopCardType})

      if (canOnlyAttachToTypes && !canOnlyAttachToTypes.includes(hoverOverTopCardType)) {
        dispatch(setDraggingHoverOverStackId(null));
        dispatch(setDraggingHoverOverDirection(null));
        return;
      }
      if (canOnlyHaveAttachmentsOfTypes && !canOnlyHaveAttachmentsOfTypes.includes(draggingTopCardType)) {
        dispatch(setDraggingHoverOverStackId(null));
        dispatch(setDraggingHoverOverDirection(null));
        return;
      }

      dispatch(setDraggingHoverOverStackId(hoverData.stackId));
      dispatch(setDraggingHoverOverDirection(hoverData.direction));
    } else {
      dispatch(setDraggingHoverOverStackId(null));
      dispatch(setDraggingHoverOverDirection(null));
    }
    dispatch(setDraggingMouseCurrentX(ev.clientX));
    dispatch(setDraggingMouseCurrentY(ev.clientY));
    // dispatch(setDraggingMouseCurrentX(centerX));
    // dispatch(setDraggingMouseCurrentY(centerY));
    //setMousePosition({ x: ev.clientX, y: ev.clientY });
  };

  const updateMouseDown = (e) => {
    console.log("updateMouseDown", e)
    const rect = e.target.parentElement.parentElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    console.log(`Relative mouse position: ${x}, ${y}`);
    dispatch(setDraggingMouseDownX(x));
    dispatch(setDraggingMouseDownY(y));
    //setMouseDownPosition({ x: x, y: y });
  }

  const onBeforeDragStart = (result) => {
    const droppableId = result.source.droppableId;
    dispatch(setDraggingFromDroppableId(droppableId));
    dispatch(setDraggingStackId(result.draggableId));
    dispatch(setDraggingEnd(false));
    dispatch(setTempDragStack(null));


    if (!result?.draggableId || !result?.source?.droppableId) return;
    updateDraggingUi(result.draggableId, result.source.droppableId);

    setIsDragging(true);
  }

  const updateDraggingUi = (draggableId, droppableId) => {
    const region = getRegionFromId(droppableId);
    console.log("updateDraggingUi", droppableId, region)
    const destGroupId = region.groupId;
    //const [destGroupId, destRegionType, destRegionDirection] = getGroupIdAndRegionType(droppableId);

    dispatch(setDraggingHoverOverDroppableId(droppableId));

    const destStackIds = store.getState()?.gameUi?.game?.groupById[destGroupId]?.stackIds;
    setTimeout(() => {
      const rects = [];
      destStackIds.forEach(stackId => {
        if (stackId === draggableId) return;
        const stackNode = document.querySelector(`[data-rbd-draggable-id="${stackId}"]`);
        if (stackNode) {
          const stackRect = stackNode.getBoundingClientRect();
          stackRect.stackId = stackId;
          rects.push(stackRect);
        }
      })
      dispatch(setDraggingStackRectangles(rects));
      const groupRectangle = document.querySelector(`[data-rbd-droppable-id="${droppableId}"]`).getBoundingClientRect();
      dispatch(setDraggingGroupRectangle(groupRectangle));
    }, 200);
  }

  const onDragUpdate = (result) => {
    if (!result?.draggableId || !result?.destination?.droppableId) return;
    updateDraggingUi(result.draggableId, result.destination.droppableId);
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", updateMousePosition);
    }

    return () => {
      if (isDragging) {
        document.removeEventListener("mousemove", updateMousePosition);
      }
    };
  }, [isDragging]);

  useEffect(() => {
    document.addEventListener("mousedown", updateMouseDown);

    return () => {
      document.removeEventListener("mousedown", updateMouseDown);
    };
  }, []);

  const onDragEnd = (result) => {
    if (!isDragging) return;
    setIsDragging(false);
    const draggingEnd = store.getState()?.playerUi?.dragging?.end;
    if (draggingEnd) return;
    const draggingEndDelay = store.getState()?.playerUi?.dragging?.endDelay;
    console.log('log2 onDragEnd:', result, {draggingEnd, draggingEndDelay});
    const game = store.getState()?.gameUi.game;
    const playerUiDragging = store.getState()?.playerUi?.dragging;
    const keypressShift = store.getState()?.playerUi?.keypress?.Shift;
    const groupById = game.groupById;
    const orig = result.source;
    const origDroppableId = orig.droppableId;

    const origRegion = getRegionFromId(origDroppableId);
    console.log("origRegion", origDroppableId, origRegion)
    const origGroupId = origRegion.groupId;
    //const [origGroupId, origRegionType, origRegionDirection] = getGroupIdAndRegionType(origDroppableId);
    const origGroup = groupById[origGroupId];
    const origGroupStackIds = origGroup.stackIds;
    const origStackId = origGroupStackIds[orig.index];    
    const origStack = game.stackById[origStackId];
    const origStackCardIds = origStack.cardIds;
    const topOfOrigStackCardId = origStackCardIds[0];
    const topOfOrigStackCard = game.cardById[topOfOrigStackCardId];
    const allowFlip = keypressShift ? false : true; 
    var dest = result.combine ? result.combine : result.destination;
    if (!dest) {
      dest = {...orig};
    }
    console.log("Dest: ", dest)

    const destDroppableId = dest?.droppableId;
    const destRegion = getRegionFromId(destDroppableId);
    const destGroupId = destRegion.groupId;
    const destRegionType = destRegion.type;
    //const [destGroupId, destRegionType, destRegionDirection] = getGroupIdAndRegionType(destDroppableId);
    const afterDragName = getAfterDragName(game, origStackId, destGroupId, allowFlip);

    const destGroup = groupById[destGroupId];
    const destGroupStackIds = destGroup.stackIds;

    dispatch(setDraggingEnd(true));
    dispatch(setDraggingDefault());
    dispatch(setDraggingEndDelay(true));
    setTimeout(() => {
      //dispatch(setDraggingStackId(null));
      dispatch(setDraggingEndDelay(false));
      dispatch(setTempDragStack(null));
    }, 200);



    const draggableNode = document.querySelector(`[data-rbd-draggable-id="${result.draggableId}"]`);

    console.log("Dropped in: ", destGroupId, draggableNode)
    var stackLeft = 0;
    var stackTop = 0;

    const playerUiDroppableRefs = store.getState()?.playerUi?.droppableRefs;
    if (playerUiDroppableRefs?.[destGroupId]) {
      const droppableRect = playerUiDroppableRefs[destGroupId].getBoundingClientRect();
      console.log("Droppable Rect: ", droppableRect)
      // const xRelative = mousePosition.x - mouseDownPosition.x - droppableRect.left;
      // const yRelative = mousePosition.y - mouseDownPosition.y - droppableRect.top;
      const xRelative = playerUiDragging.mouseCurrentX - playerUiDragging.mouseDownX - droppableRect.left;
      const yRelative = playerUiDragging.mouseCurrentY - playerUiDragging.mouseDownY - droppableRect.top;
      stackLeft = xRelative/droppableRect.width*100 + '%';
      stackTop = yRelative/droppableRect.height*100 + '%';

      console.log("stackPlacement", playerUiDragging.mouseCurrentX, playerUiDragging.mouseDownX, droppableRect.left, xRelative, stackLeft)
    }

    if (destRegionType === "free") {
      //alert(`setting left and top to ${stackLeft} and ${stackTop}`)
      dispatch(setTempDragStack({
        stackId: origStackId, 
        toGroupId: destGroupId,
        left: stackLeft,
        top: stackTop
      }));
    }
    
    // Combine
    if (result.combine) {
      console.log("Combine onDragEnd", result.combine)
      // dest.index = -1;
      // for(var i=0; i<=destGroupStackIds.length; i++) {
      //   if(destGroupStackIds[i] === dest.draggableId){
      //     dest.index = i;
      //   }
      // }
      // if (!dest.index < 0) return;
      const destStackId = result.combine.draggableId; //destGroupStackIds[dest.index];
      const destStack = game.stackById[destStackId];
      const destStackCardIds = destStack.cardIds;
      const card0 = game.cardById[destStackCardIds[0]];
      const stackIndex = card0.stackIndex;
      const controlPressed = store.getState()?.playerUi?.keypress?.Control;
      if (controlPressed) result.combine.direction = "behind";
      //const newDestStackCardIds = destStackCardIds.concat(origStackCardIds);

      // const newDestStack = {
      //   ...destStack,
      //   cardIds: newDestStackCardIds,
      // }

      // const newOrigGroupStackIds = Array.from(origGroupStackIds);
      // newOrigGroupStackIds.splice(orig.index, 1);

      // const newOrigGroup = {
      //   ...origGroup,
      //   stackIds: newOrigGroupStackIds
      // }
      // We could add some logic here to flip the card locally instantly, but there would still be a delay to get load the image
      // const updates = [["cardById",topOfOrigStackCardId,"currentSide", "A"]];
      // dispatch(setValues({updates: updates}));

      //dispatch(setStackIds(newOrigGroup)); // This results is a jitter because the cardIndex is still 0 so it's briefly placed in the parent spot
      //dispatch(setCardIds(newDestStack));
      doActionList([
        ["LOG", "$ALIAS_N", " attached ", afterDragName, " from ", "$GAME.groupById."+origGroupId+".label", " to ", ["FACEUP_NAME_FROM_STACK_ID", destStackId], "."],
        ["MOVE_STACK", origStackId, destGroupId, stackIndex, {"combine": result.combine.direction, "allowFlip": allowFlip}],
      ])
    }

    
    // Dragged somewhere
    else {
      // Dropped nowhere
      if (!result.destination) {
        return;
      }
      if (destRegionType === "free") {
        dest.index = destGroupStackIds.length;
      }
      if (destRegionType === "pile") {
        dest.index = 0; // Fix placement bug when a pile region is wide and a card is placed to the right of the top card
      }

      // // Did not move anywhere - can bail early -- Need to disable this check because free zones can have cards move but stay at same index
      // if (
      //   orig.droppableId === dest.droppableId &&
      //   orig.index === dest.index
      // ) {
      //   // Do nothing
      //   return;
      // } else {
        // Moved to a different spot
        const newGroupById = reorderGroupStackIds(groupById, origGroupId, orig.index, destGroupId, dest.index);
        // We could add some logic here to flip the card locally instantly, but there would still be a delay to get load the image
        // const updates = [["game", "cardById", topOfOrigStackCardId, "currentSide", "A"]];
        // dispatch(setValues({updates: updates}));
        doActionList([
          ["LOG", "$ALIAS_N", " moved ", afterDragName, " from ", "$GAME.groupById."+origGroupId+".label", " to ", "$GAME.groupById."+destGroupId+".label", "."],
          ["MOVE_STACK", origStackId, destGroupId, dest.index, {"allowFlip": allowFlip}],
          ["COND",
            ["DEFINED", `$GAME.stackById.${origStackId}`],
            [
              ["SET", `/stackById/${origStackId}/left`, stackLeft],
              ["SET", `/stackById/${origStackId}/top`, stackTop]
            ]
          ]
        ])
        dispatch(setGroupById(newGroupById));
      //}
    }

  }

  return(

      <ArcherContainer 
        className="h-full w-full" 
        strokeColor="rgba(255,0,0,0.6)" 
        strokeWidth="15"
        svgContainerStyle={{ 
          zIndex: 2e3,
        }} 
        endShape={{
          arrow: {
            arrowLength: 1,
            arrowThickness: 2,
          }
        }}>
      <DragDropContext onDragEnd={onDragEnd} onBeforeDragStart={onBeforeDragStart} onDragUpdate={onDragUpdate}>
        <Table onDragEnd={onDragEnd}/>
      </DragDropContext>
    </ArcherContainer>
  )
});