
import React, { useCallback, useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { useSelector, useDispatch } from 'react-redux';
import { setStackIds, setCardIds, setGroupById } from "../store/gameUiSlice";
import { getGroupIdAndRegionType, reorderGroupStackIds } from "./Reorder";
import store from "../../store";
import { setDraggingEnd, setDraggingEndDelay, setDraggingStackId, setDraggingFromGroupId, setTempDragStack, setDraggingMouseCurrentX, setDraggingMouseCurrentY, setDraggingMouseDownX, setDraggingMouseDownY, setDraggingToGroupId, setDraggingToRegionType, setDraggingStackRectangles, setDraggingGroupRectangle, setDraggingDefault, setDraggingHoverOverStackId, setDraggingHoverOverDirection } from "../store/playerUiSlice";
import { Table } from "./Table";
import { useDoActionList } from "./hooks/useDoActionList";
import { ArcherContainer } from 'react-archer';
import { COMBINE_REGION_WIDTH_FACTOR } from "./functions/common";

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

const isXYinBox = (x, y, boxX, boxY, boxWidth, boxHeight) => {
  return (x >= boxX && x <= boxX + boxWidth && y >= boxY && y <= boxY + boxHeight);
}

const getHoverStackIdAndDirection = (mouseCurrentX, mouseCurrentY, draggingRectangle, stackRectangles, groupRectangle) => {
  console.log("getHoverStackIdAndDirection", mouseCurrentX, mouseCurrentY, draggingRectangle, stackRectangles, groupRectangle)
  if (!stackRectangles || stackRectangles.length === 0 || !groupRectangle) {
    return {stackId: null, direction: null};
  }
  
  for (let i = 0; i < stackRectangles.length; i++) {
    const stackRectangle = stackRectangles[i];
    const combineRegionWidth = COMBINE_REGION_WIDTH_FACTOR*draggingRectangle.width;
    const leftRectangle = {
      left: stackRectangle.left - combineRegionWidth,
      top: stackRectangle.top + 0.25*stackRectangle.height,
      width: combineRegionWidth*2,
      height: 0.5*stackRectangle.height
    }
    const rightRectangle = {
      left: stackRectangle.left + stackRectangle.width - combineRegionWidth,
      top: stackRectangle.top + 0.25*stackRectangle.height,
      width: combineRegionWidth*2,
      height: 0.5*stackRectangle.height
    }
    const topRectangle = {
      left: stackRectangle.left - combineRegionWidth,
      top: stackRectangle.top - 0.25*stackRectangle.height,
      width: combineRegionWidth*2 + stackRectangle.width,
      height: 0.5*stackRectangle.height
    }
    const bottomRectangle = {
      left: stackRectangle.left - combineRegionWidth,
      top: stackRectangle.top + stackRectangle.height - 0.25*stackRectangle.height,
      width: combineRegionWidth*2 + stackRectangle.width,
      height: 0.5*stackRectangle.height
    }
    const isInsideLeft = isXYinBox(mouseCurrentX, mouseCurrentY, leftRectangle.left, leftRectangle.top, leftRectangle.width, leftRectangle.height);
    const isInsideRight = isXYinBox(mouseCurrentX, mouseCurrentY, rightRectangle.left, rightRectangle.top, rightRectangle.width, rightRectangle.height);
    const isInsideTop = isXYinBox(mouseCurrentX, mouseCurrentY, topRectangle.left, topRectangle.top, topRectangle.width, topRectangle.height);
    const isInsideBottom = isXYinBox(mouseCurrentX, mouseCurrentY, bottomRectangle.left, bottomRectangle.top, bottomRectangle.width, bottomRectangle.height);
    if (i==0) {
      console.log("isInsideLeft", isInsideLeft, "isInsideRight", isInsideRight, "isInsideTop", isInsideTop, "isInsideBottom", isInsideBottom)
    }
    if (isInsideLeft) {
      return {stackId: stackRectangle.stackId, direction: "left"};
    } else if (isInsideRight) {
      return {stackId: stackRectangle.stackId, direction: "right"};
    } else if (isInsideTop) {
      return {stackId: stackRectangle.stackId, direction: "top"};
    } else if (isInsideBottom) {
      return {stackId: stackRectangle.stackId, direction: "bottom"};
    }
  }
  return {stackId: null, direction: null};
}


export const DragContainer = React.memo(({}) => {
  console.log("Rendering DragContainer");
  const dispatch = useDispatch();
  const doActionList = useDoActionList();
  const [isDragging, setIsDragging] = useState(false);
  //const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  //const [mouseDownPosition, setMouseDownPosition] = useState({ x: 0, y: 0 });
  const playerUiDroppableRefs = useSelector(state => state?.playerUi?.droppableRefs);

  const updateMousePosition = ev => {
    const draggingStackId = store.getState()?.playerUi?.dragging?.stackId;
    const draggableNode = document.querySelector(`[data-rbd-draggable-id="${draggingStackId}"]`);
    const draggableRect = draggableNode.getBoundingClientRect();
    draggableRect.stackId = draggingStackId;
    const centerX = draggableRect.left + draggableRect.width / 2;
    const centerY = draggableRect.top + draggableRect.height / 2;

    const hoverData = getHoverStackIdAndDirection(centerX, centerY, draggableRect, store.getState()?.playerUi?.dragging?.stackRectangles, store.getState()?.playerUi?.dragging?.groupRectangle);
    console.log("hoverData", hoverData)
    if (hoverData.stackId) {
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
    const rect = e.target.parentElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    console.log(`Relative mouse position: ${x}, ${y}`);
    dispatch(setDraggingMouseDownX(x));
    dispatch(setDraggingMouseDownY(y));
    //setMouseDownPosition({ x: x, y: y });
  }

  const onBeforeDragStart = (result) => {
    const droppableId = result.source.droppableId;
    const [groupId, regionType] = getGroupIdAndRegionType(droppableId);
    dispatch(setDraggingFromGroupId(groupId));
    dispatch(setDraggingStackId(result.draggableId));
    dispatch(setDraggingEnd(false));
    dispatch(setDraggingEndDelay(false));
    dispatch(setTempDragStack(null));


    if (!result?.draggableId || !result?.source?.droppableId) return;
    updateDraggingUi(result.draggableId, result.source.droppableId);

    setIsDragging(true);
  }

  const updateDraggingUi = (draggableId, droppableId) => {
    const draggableNode = document.querySelector(`[data-rbd-draggable-id="${draggableId}"]`);
    const draggableRect = draggableNode.getBoundingClientRect();

    const [destGroupId, destRegionType] = getGroupIdAndRegionType(droppableId);

    dispatch(setDraggingToGroupId(destGroupId));
    dispatch(setDraggingToRegionType(destRegionType));

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
    console.log('log2 onDragEnd:', result);
    const game = store.getState()?.gameUi.game;
    const playerUiDragging = store.getState()?.playerUi?.dragging;
    const keypressShift = store.getState()?.playerUi?.keypress?.Shift;
    const groupById = game.groupById;
    const orig = result.source;
    const origDroppableId = orig.droppableId;
    const [origGroupId, origRegionType] = getGroupIdAndRegionType(origDroppableId);
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
    const [destGroupId, destRegionType] = getGroupIdAndRegionType(destDroppableId);
    const afterDragName = getAfterDragName(game, origStackId, destGroupId, allowFlip);

    const destGroup = groupById[destGroupId];
    const destGroupStackIds = destGroup.stackIds;

    // dispatch(setDraggingFromGroupId(null));
    // dispatch(setDraggingEnd(true));
    dispatch(setDraggingDefault());
    dispatch(setDraggingEndDelay(false));
    setTimeout(() => {
      //dispatch(setDraggingStackId(null));
      dispatch(setDraggingEndDelay(true));
      dispatch(setTempDragStack(null));
    }, 200);



    const draggableNode = document.querySelector(`[data-rbd-draggable-id="${result.draggableId}"]`);

    console.log("Dropped in: ", destGroupId, playerUiDroppableRefs, draggableNode)
    var stackLeft = 0;
    var stackTop = 0;

    if (playerUiDroppableRefs?.[destGroupId]) {
      const droppableRect = playerUiDroppableRefs[destGroupId].getBoundingClientRect();
      console.log("Droppable Rect: ", droppableRect)
      // const xRelative = mousePosition.x - mouseDownPosition.x - droppableRect.left;
      // const yRelative = mousePosition.y - mouseDownPosition.y - droppableRect.top;
      const xRelative = playerUiDragging.mouseCurrentX - playerUiDragging.mouseDownX - droppableRect.left;
      const yRelative = playerUiDragging.mouseCurrentY - playerUiDragging.mouseDownY - droppableRect.top;
      stackLeft = xRelative/droppableRect.width*100;
      stackTop = yRelative/droppableRect.height*100;
    }

    dispatch(setTempDragStack({
      stackId: origStackId, 
      toGroupId: destGroupId,
      left: stackLeft,
      top: stackTop
    }));
    
    // Combine
    if (result.combine) {
    
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

      dispatch(setStackIds(newOrigGroup)); // This results is a jitter because the cardIndex is still 0 so it's briefly placed in the parent spot
      dispatch(setCardIds(newDestStack));
      doActionList([
        ["LOG", "$ALIAS_N", " attached ", afterDragName, " from ", "$GAME.groupById."+origGroupId+".label", " to ", ["FACEUP_NAME_FROM_STACK_ID", destStackId], "."],
        ["MOVE_STACK", origStackId, destGroupId, dest.index, {"combine": true, "allowFlip": allowFlip}]
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

      // // Did not move anywhere - can bail early -- Need to disable this check because free zones can have cards move but stay at same index
      // if (
      //   orig.droppableId === dest.droppableId &&
      //   orig.index === dest.index
      // ) {
      //   // Do nothing
      //   return;
      // } else {
        // Moved to a different spot
        const newGroupById = reorderGroupStackIds(groupById, orig, dest);
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