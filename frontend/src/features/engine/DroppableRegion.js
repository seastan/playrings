import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import styled from "@emotion/styled";
import { Droppable } from "react-beautiful-dnd";
import { PileImage } from "./PileImage"
import { useLayout } from "./hooks/useLayout";
import { setDraggingToGroupId, setDraggingToRegionType, setDroppableRefs } from "../store/playerUiSlice";
import { StackDraggableFree } from "./StackDraggableFree";
import { StackDraggableSorted } from "./StackDraggableSorted";

const Container = styled.div`
  background-color: ${props => props.isDraggingOver ? "rgba(1,1,1,0.3)" : ""};
  moz-box-shadow: ${props => props.isDraggingOver ? "0 0 15px 12px rgba(1,1,1,0.3)" : ""};
  webkit-box-shadow: ${props => props.isDraggingOver ? "0 0 15px 12px rgba(1,1,1,0.3)" : ""};
  box-shadow: ${props => props.isDraggingOver ? "0 0 15px 12px rgba(1,1,1,0.3)" : ""};
  -webkit-transition: all 0.2s;
  -moz-transition: all 0.2s;
  -o-transition: all 0.2s;
  transition: all 0.2s;
  
  height: 100%;
  width: 100%;
  user-select: none;
  overflow-x: ${props => props.direction === "vertical" ? "hidden" : "auto"};
  overflow-y: ${props => props.direction === "vertical" ? "auto" : "hidden"};
  max-height: 100%;
  position: relative;
`;

export const DropZone = styled.div`
  /* stop the list collapsing when empty */
  position: absolute;
  display: ${props => props.direction === "vertical" ? "" : "flex"};
  overflow-x: none;
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
    const draggingFromGroupId = state?.playerUi?.dragging.fromGroupId;
    return isPile && stackIds.length > 0 && ((mouseHere && draggingFromGroupId === null) || draggingFromGroupId === groupId);
  });
  // Truncate stacked piles
  console.log("Rendering StacksList", {groupId, region});
  var stackIdsToShow = stackIds;
  if (isPile) stackIdsToShow = [];
  if (showTopCard) stackIdsToShow = [stackIds[0]];

  if (!stackIdsToShow) return null;
  return (
    stackIdsToShow?.map((stackId, stackIndex) => (
      (selectedStackIndices.includes(stackIndex)) ? (
        <StackDraggableSorted
          key={stackId}
          groupId={groupId}
          region={region}
          stackIndex={stackIndex}
          stackId={stackId}
          numStacks={selectedStackIndices.length}
          hidden={isPile && isDraggingOver && !isDraggingFrom}
          onDragEnd={onDragEnd}
        /> 
      ) : null 
    ))
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
      droppableId={groupId + "--" + region.type}
      key={groupId}
      isDropDisabled={false}
      isCombineEnabled={region.type === "free" ? false : group.canHaveAttachments}
      direction={region.direction}>
      {(dropProvided, dropSnapshot) => {
        if (dropSnapshot.isDraggingOver) {
          dispatch(setDraggingToGroupId(groupId));
          dispatch(setDraggingToRegionType(region.type));
        }
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

// export const FreeZone = React.memo(({
//   groupId,
//   region,
//   containerRef
// }) => {
//   console.log("Rendering Free Stacks for ",groupId, region);
//   const dispatch = useDispatch();
//   const group = useSelector(state => state?.gameUi?.game?.groupById?.[groupId]);
//   const stackIds = group.stackIds;
  
//   return(
//     <Droppable
//       droppableId={groupId + "--" + region.type}
//       key={groupId}
//       isDropDisabled={false}
//       isCombineEnabled={true}
//       direction={region.direction}>
//       {(dropProvided, dropSnapshot) => {
//         if (dropSnapshot.isDraggingOver) dispatch(setDraggingToRegionType(region.type));
//         return(
//         <Container
//           ref={containerRef}
//           isDraggingOver={dropSnapshot.isDraggingOver}
//           isDropDisabled={false}
//           isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
//           {...dropProvided.droppableProps}
//           direction={region.direction}
//           //onMouseLeave={() => setMouseHere(region.type === "pile" && false)}
//           >
//             <DropZone 
//               ref={dropProvided.innerRef} 
//               direction={region.direction}
//               margin={0}>
//               <FreeStacksList
//                 region={region} 
//                 stackIds={stackIds}/>
//               {dropProvided.placeholder}
              
//             </DropZone>
//         </Container>)
//       }}
//     </Droppable>
//   )
// })

const StacksListFree = React.memo(({
  region,
  stackIds,
  onDragEnd
}) => {

  return (
    stackIds?.map((stackId, stackIndex) => (
      <StackDraggableFree
        key={stackId}
        region={region}
        stackIndex={stackIndex}
        stackId={stackId}
        onDragEnd={onDragEnd}
      /> 
    ))
  ) 
});


export const FreeStackContainer = styled.div`
  position: absolute;
  userSelect: none;
  margin: 0vh ${props => props.margin}vh 0vh 0vh;
  left: ${props => props.stackLeft}%;
  top: ${props => props.stackTop}%;
  width: ${props => props.stackWidth}vh;
  height: ${props => props.stackHeight}vh;
`;




