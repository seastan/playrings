import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import styled from "@emotion/styled";
import { Droppable } from "@seastan/react-beautiful-dnd";
//import { Droppable } from "seastan-react-beautiful-dnd";
import { PileImage } from "./PileImage";
import { useLayout } from "./hooks/useLayout";
import { setDroppableRefs } from "../store/playerUiSlice";
import { StackDraggable } from "./StackDraggable";
import { getGroupIdAndRegionType } from "./Reorder";

const Container = styled.div`
  background-color: ${props => props.isDraggingOver ? "rgba(100,100,100,0.3)" : ""};
  box-shadow: ${props => props.isDraggingOver ? "0 0 15px 12px rgba(100,100,100,0.3)" : ""};
  transition: all 0.2s;
  height: 100%;
  width: 100%;
  user-select: none;
  max-height: 100%;
  position: relative;
  overflow: visible;
`;

export const DropZone = styled.div`
  /* stop the list collapsing when empty */
  position: absolute;
  display: ${props => props.direction === "vertical" ? "" : "block"};
  overflow-y: ${props => props.type === "row" ? "scroll" : props.type === "fan" ? "hidden" : ""};
  white-space: nowrap;
  width: calc(100% - ${props => props.margin}vh);
  height: 100%;
  min-height: 100%;
  padding: 0.5vh;
  margin: 0 0 0 ${props => props.margin}vh;
`;

const StacksListSorted = React.memo(({
  isDraggingOver,
  isDraggingFrom,
  groupId,
  region,
  stackIds,
  mouseHere,
  selectedStackIndices,
  onDragEnd
}) => {
  const isPile = region.type == "pile";
  const showTopCard = useSelector((state) => {
    const draggingFromDroppableId = state?.playerUi?.dragging?.fromDroppableId;
    const [draggingFromGroupId, dragginFromRegionType, draggingFromRegionDirection] = getGroupIdAndRegionType(draggingFromDroppableId);
    return isPile && stackIds.length > 0 && ((mouseHere && draggingFromGroupId === null) || draggingFromGroupId === groupId);
  });
  // Truncate stacked piles
  console.log("Rendering StacksList", {groupId, region});
  var stackIdsToShow = stackIds;
  if (isPile) stackIdsToShow = [];
  if (showTopCard) stackIdsToShow = [stackIds[0]];

  if (!stackIdsToShow) return null;
  return (
    <>
    {/* <BoundingBoxesSorted
      region={region}
      stackIdsToShow={stackIdsToShow}
    /> */}
    {stackIdsToShow?.map((stackId, stackIndex) => (
      (selectedStackIndices.includes(stackIndex)) ? (
        <StackDraggable
          key={stackId}
          region={region}
          stackIndex={stackIndex}
          stackId={stackId}
          numStacksVisible={selectedStackIndices.length}
          onDragEnd={onDragEnd}
        /> 
      ) : null 
    ))}
    </>
  ) 
});

export const DroppableRegion = React.memo(({
  groupId,
  region,
  selectedStackIndices,
  onDragEnd
}) => {
  const containerRef = useRef(null);
  const dispatch = useDispatch();
  console.log("Rendering Stacks for ",groupId, region);
  const [mouseHere, setMouseHere] = useState(false);
  const layout = useLayout();
  const rowSpacing = layout?.rowSpacing;
  const group = useSelector(state => state?.gameUi?.game?.groupById?.[groupId]);
  const stackIds = group.stackIds;

  useEffect(() => {
    dispatch(setDroppableRefs({id: groupId, ref: containerRef.current}));
  }, [groupId]);


  //if (region.type === "free") return <FreeZone groupId={groupId} region={region} containerRef={containerRef}/>
  return(
    <Droppable
      droppableId={groupId + "--" + region.type + "--" + region.direction}
      key={groupId}
      isDropDisabled={false}
      //isCombineEnabled={region.type === "free" ? false : group.canHaveAttachments}
      isCombineEnabled={false}
      layerIndex={region.layerIndex || 0}
      direction={region.direction}>
      {(dropProvided, dropSnapshot) => {
        const timestamp = new Date().getTime();
        console.log("Rendering DroppableRegion", {groupId, timestamp})
        return(
          <Container
            ref={containerRef}
            isDraggingOver={dropSnapshot.isDraggingOver}
            isDropDisabled={false}
            isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
            {...dropProvided.droppableProps}
            direction={region.direction}
            onMouseEnter={() => setMouseHere(region.type === "pile" && true)} 
            //onMouseLeave={() => setMouseHere(region.type === "pile" && false)}
            >
              <PileImage 
                region={region} 
                stackIds={stackIds} 
                isDraggingOver={dropSnapshot.isDraggingOver} 
                isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}>
              </PileImage>
              <DropZone 
                ref={dropProvided.innerRef} 
                direction={region.direction}
                type={region.type}
                margin={region.type === "row" ? rowSpacing/2 : 0}>
                  {region.type === "free" ? 
                    <StacksListFree
                      region={region} 
                      stackIds={stackIds}
                      onDragEnd={onDragEnd}
                    />
                    :
                    <StacksListSorted
                      isDraggingOver={dropSnapshot.isDraggingOver}
                      isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
                      groupId={groupId}
                      region={region} 
                      stackIds={stackIds}
                      mouseHere={mouseHere}
                      selectedStackIndices={(selectedStackIndices ? selectedStackIndices : [...Array(stackIds.length).keys()])}
                      onDragEnd={onDragEnd}
                    />
                  }
                {dropProvided.placeholder}
              </DropZone>
          </Container>
        )
      }}
    </Droppable>
  )
})

const StacksListFree = React.memo(({
  region,
  stackIds,
  onDragEnd
}) => {
  console.log("Rendering StacksListFree", region.groupId);
  return (
    stackIds?.map((stackId, stackIndex) => (
      <StackDraggable
        key={stackId}
        region={region}
        stackIndex={stackIndex}
        stackId={stackId}
        numStacksVisible={stackIds.length}
        onDragEnd={onDragEnd}
      /> 
    ))
  ) 
});





