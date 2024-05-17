import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import styled from "@emotion/styled";
import { Droppable } from "react-beautiful-dnd";
import { PileImage } from "./PileImage"
import { useLayout } from "./hooks/useLayout";
import { setDraggingHoverOverDirection, setDraggingHoverOverStackId, setDraggingRectangles, setDroppableRefs } from "../store/playerUiSlice";
import { StackDraggable } from "./StackDraggable";
import { getStackDimensions } from "./functions/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { getGroupIdAndRegionType } from "./Reorder";

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
  display: ${props => props.direction === "vertical" ? "" : "block"};
  white-space: nowrap;
  width: calc(100% - ${props => props.margin}vh);
  height: 100%;
  min-height: 100%;
  padding: 0.5vh;
  margin: 0 0 0 ${props => props.margin}vh;
`;

const isXYinBox = (x, y, boxX, boxY, boxWidth, boxHeight) => {
  return (x >= boxX && x <= boxX + boxWidth && y >= boxY && y <= boxY + boxHeight);
}

// const CombineBox = React.memo(({
//   top, left, width, height, isInside
// }) => {
//   if (!isInside) return null;
//   return (
//     <div
//       className="flex items-center justify-center"
//       style={{
//         position: "absolute",
//         top: `${top}px`,
//         left: `${left}px`,
//         width: `${width}px`,
//         height: `${height}px`,
//         // border: "1px solid red",
//         // backgroundColor: isInside ? "rgba(255,0,0,0.8)" : "rgba(255,0,0,0.3)",
//         zIndex: 1e9
//       }}
//     >
//       <div
//         className="flex items-center justify-center rounded-lg bg-gray-200"
//         style={{
//           width: "6vh",
//           height: "6vh",
//           border: "0.5vh solid black",
//         }}
//       >
//         <FontAwesomeIcon className="w-full h-full" style={{fontSize: '4vh'}} icon={faLink} />
//       </div>
//     </div>
//   )
// });


// const CombineBoxes = React.memo(({
//   region,
// }) => {
//   const dispatch = useDispatch();
//   const dragging = useSelector(state => state?.playerUi?.dragging);
//   const draggingStackId = dragging?.stackId;
//   const draggingToGroupId = dragging?.toGroupId;
//   const stackRectangles = dragging?.stackRectangles;
//   const groupRectangle = dragging?.groupRectangle;
//   const mouseCurrentX = dragging?.mouseCurrentX;
//   const mouseCurrentY = dragging?.mouseCurrentY;
//   if (draggingToGroupId !== region.groupId) return null;
//   if (!stackRectangles || stackRectangles.length === 0) return null;
//   if (!groupRectangle) return null;
//   console.log("Rendering BoundingBoxes", {region, draggingToGroupId, rectangles: stackRectangles})
//   return (
//     <>
//     {stackRectangles?.map((stackRectangle, index) => {
//       if (stackRectangle.stackId == draggingStackId) return null;
//       const combineRegionWidth = 0.45*stackRectangle.width;
//       console.log("Rendering BoundingBox", {rect: stackRectangle})
//       const leftRectangle = {
//         left: stackRectangle.left - combineRegionWidth,
//         top: stackRectangle.top + 0.25*stackRectangle.height,
//         width: combineRegionWidth*2,
//         height: 0.5*stackRectangle.height
//       }
//       const rightRectangle = {
//         left: stackRectangle.left + stackRectangle.width - combineRegionWidth,
//         top: stackRectangle.top + 0.25*stackRectangle.height,
//         width: combineRegionWidth*2,
//         height: 0.5*stackRectangle.height
//       }
//       const topRectangle = {
//         left: stackRectangle.left - combineRegionWidth,
//         top: stackRectangle.top - 0.25*stackRectangle.height,
//         width: combineRegionWidth*2 + stackRectangle.width,
//         height: 0.5*stackRectangle.height
//       }
//       const bottomRectangle = {
//         left: stackRectangle.left - combineRegionWidth,
//         top: stackRectangle.top + stackRectangle.height - 0.25*stackRectangle.height,
//         width: combineRegionWidth*2 + stackRectangle.width,
//         height: 0.5*stackRectangle.height
//       }

//       const isInsideLeft = isXYinBox(mouseCurrentX, mouseCurrentY, leftRectangle.left, leftRectangle.top, leftRectangle.width, leftRectangle.height);
//       const isInsideRight = isXYinBox(mouseCurrentX, mouseCurrentY, rightRectangle.left, rightRectangle.top, rightRectangle.width, rightRectangle.height);
//       const isInsideTop = isXYinBox(mouseCurrentX, mouseCurrentY, topRectangle.left, topRectangle.top, topRectangle.width, topRectangle.height);
//       const isInsideBottom = isXYinBox(mouseCurrentX, mouseCurrentY, bottomRectangle.left, bottomRectangle.top, bottomRectangle.width, bottomRectangle.height);

//       if (isInsideLeft) {
//         dispatch(setDraggingHoverOverStackId(stackRectangle.stackId));
//         dispatch(setDraggingHoverOverDirection("left"));
//       } else if (isInsideRight) {
//         dispatch(setDraggingHoverOverStackId(stackRectangle.stackId));
//         dispatch(setDraggingHoverOverDirection("right"));
//       } else if (isInsideTop) {
//         dispatch(setDraggingHoverOverStackId(stackRectangle.stackId));
//         dispatch(setDraggingHoverOverDirection("top"));
//       } else if (isInsideBottom) {
//         dispatch(setDraggingHoverOverStackId(stackRectangle.stackId));
//         dispatch(setDraggingHoverOverDirection("bottom"));
//       }

//       return (
//         <>
//           <CombineBox
//             top={leftRectangle.top - groupRectangle.top}
//             left={leftRectangle.left - groupRectangle.left}
//             width={leftRectangle.width}
//             height={leftRectangle.height}
//             isInside={isInsideLeft}
//           />
//           <CombineBox
//             top={rightRectangle.top - groupRectangle.top}
//             left={rightRectangle.left - groupRectangle.left}
//             width={rightRectangle.width}
//             height={rightRectangle.height}
//             isInside={isInsideRight}
//           />
//           <CombineBox
//             top={topRectangle.top - groupRectangle.top}
//             left={topRectangle.left - groupRectangle.left}
//             width={topRectangle.width}
//             height={topRectangle.height}
//             isInside={isInsideTop}
//           />
//           <CombineBox
//             top={bottomRectangle.top - groupRectangle.top}
//             left={bottomRectangle.left - groupRectangle.left}
//             width={bottomRectangle.width}
//             height={bottomRectangle.height}
//             isInside={isInsideBottom}
//           />
//         </>
//       )
//       })}
//     </>
//   )
// });

//   const layout = useLayout();
//   const stackIds = state?.gameUi?.game?.groupById?.[region.groupId]?.stackIds;
//   const listOfStackDimensions = stackIds?.map((stackId) => {
//     return getStackDimensions(stackId, layout, state)
//   });
//   // Accumulate the stack deminsions to get a list of stack XYs
//   const listOfStackLocations = [{left: 0, top: 0}];
//   for (var i = 1; i < listOfStackDimensions.length; i++) {
//     const prevStack = listOfStackDimensions[i-1];
//     const dLeft = region.direction === "horizontal" ? prevStack.width + layout.rowSpacing : 0;
//     const dTop = region.direction === "vertical" ? prevStack.height : 0;
//     const left = listOfStackLocations[i-1].left + dLeft;
//     const top = listOfStackLocations[i-1].top + dTop;
//     listOfStackLocations.push({left: left, top: top});
//   }
//   // Merge the dimensions with the XYs into a list of geometries
//   const listOfStackGeometries = [];
//   for (var i = 0; i < listOfStackDimensions.length; i++) {
//     const stackDim = listOfStackDimensions[i];
//     const stackLoc = listOfStackLocations[i];
//     listOfStackGeometries.push({...stackDim, ...stackLoc});
//   }

//   if (region.groupId === "player3PlayArea") console.log("Rendering BoundingBoxesSorted", {region, stackIds, listOfStackGeometries: listOfStackGeometries});
  
//   if (region.type === "row") {
//     return (
//       <>
//       {listOfStackGeometries?.map((stackGeo, index) => (
//         <div
//           key={index}
//           style={{
//             position: "absolute",
//             top: `${stackGeo.top}vh`,
//             left: `${stackGeo.left}vh`,
//             width: `${stackGeo.parentWidth}vh`,
//             height: `${stackGeo.parentHeight}vh`,
//             border: "1px solid red",
//             backgroundColor: "rgba(255,0,0,0.3)",
//             zIndex: 1e9
//           }}
//         />
//       ))}
//       </>
//     )
//   }
  
//   return null;
// });



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





