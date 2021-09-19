
import React, { useRef, useEffect, useContext } from "react";
import { ArrowsBetweenDivsContextProvider, ArrowBetweenDivs, LineOrientation, ArrowAnchorPlacement } from 'react-simple-arrows';
import { DragDropContext } from "react-beautiful-dnd";
import { useSelector, useDispatch } from 'react-redux';
import { setStackIds, setCardIds, setGroupById, setValues } from "./gameUiSlice";
import { reorderGroupStackIds } from "./Reorder";
import { Table } from "./Table";
import { GROUPSINFO } from "./Constants";
import { getDisplayName, getDisplayNameFlipped, getCurrentFace } from "./Helpers";
import { useKeypress } from "../../contexts/KeypressContext";
import { processGameChange } from "../automation/ProcessGameChange";
import { useTouchMode } from "../../contexts/TouchModeContext";
import { useSetTouchAction } from "../../contexts/TouchActionContext";

// custom hook for getting previous value 
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export const DragContainer = React.memo(({
  playerN,
  gameBroadcast,
  chatBroadcast,
  setTyping
}) => {
  console.log("Rendering DragContainer");
  const gameStore = state => state?.gameUi?.game;
  const dispatch = useDispatch();
  const game = useSelector(gameStore);
  const keypress = useKeypress();
  //const archerContainerRef = React.createRef();
  const arrowColors = ["rgba(255,0,0,0.6)", "rgba(0,200,0,0.6)", "rgba(0,128,255,0.6)", "rgba(128,0,255,0.6)"];
  const touchMode = useTouchMode();
  const setTouchAction = useSetTouchAction();

  const prevGame = usePrevious(game)
  const arrows1 = game.playerData.player1.arrows;
  const arrows2 = game.playerData.player1.arrows;
  const arrows3 = game.playerData.player1.arrows;
  const arrows4 = game.playerData.player1.arrows;
  const usingArrows = arrows1 || arrows2 || arrows3 || arrows4;

  const onDragEnd = (result) => {
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
      } else {
        chatBroadcast("game_update",{message: "attached "+getDisplayName(topOfOrigStackCard)+" from "+GROUPSINFO[origGroupId].name+" to "+getDisplayName(topOfDestStackCard)+" in "+GROUPSINFO[destGroupId].name+"."});
      }
      dispatch(setStackIds(newOrigGroup));
      dispatch(setCardIds(newDestStack));
      gameBroadcast("game_action", {action:"move_stack", options:{stack_id: origStackId, dest_group_id: destGroupId, dest_stack_index: dest.index, combine: true, preserve_state: keypress["Shift"]}})
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
      dispatch(setGroupById(newGroupById));
      gameBroadcast("game_action", {action:"move_stack", options:{stack_id: origStackId, dest_group_id: destGroupId, dest_stack_index: dest.index, combine: false, preserve_state: (keypress["Shift"] || destGroupId === origGroupId)}})
    }
    if (touchMode && origGroup.type === "hand" && destGroup.type === "play") {
      const cost = topOfOrigStackCard.sides.A.cost;
      if (cost) setTouchAction({action: "increment_token", options:{tokenType: "resource", "increment": -1, tokensLeft: cost}, type: "card"});
    }
  }

  return(
    <DragDropContext onDragEnd={onDragEnd}>
      {/* <HandleGameChange gameUi={gameUi} playerN={playerN} gameBroadcast={gameBroadcast} chatBroadcast={chatBroadcast}/> */}
      <ArrowsBetweenDivsContextProvider>
        {({ registerDivToArrowsContext }) => (
          <>
            {Object.keys(game.playerData).map((playerI, playerIndex) => {
              return(
                game.playerData[playerI].arrows.map((arrowStartStop, arrowIndex) => {
                  return(
                    <ArrowBetweenDivs
                      from={{ id: 'arrow-'+arrowStartStop[0], placement: ArrowAnchorPlacement.TOP }}
                      to={{ id: 'arrow-'+arrowStartStop[1], placement: ArrowAnchorPlacement.BOTTOM }}
                      orientation={LineOrientation.VERTICAL}
                      strokeWidth={4}
                      color={arrowColors[playerIndex]}
                    />
                  )
                })
              )
            })}

          <Table
            playerN={playerN}
            gameBroadcast={gameBroadcast}
            chatBroadcast={chatBroadcast}
            setTyping={setTyping}
            registerDivToArrowsContext={usingArrows ? registerDivToArrowsContext: null}
          />
        </>
        )}
      </ArrowsBetweenDivsContextProvider>

    </DragDropContext>

    //   <ArcherContainer 
    //     className="h-full w-full" 
    //     strokeColor="rgba(0,0,0,0.5)" 
    //     strokeWidth="15"
    //     svgContainerStyle={{ 
    //       zIndex: 1e5,
    //     }} 
    //     ref={archerContainerRef}
    //     endShape={{
    //       arrow: {
    //         arrowLength: 2,
    //         arrowThickness: 2,
    //       }
    //     }}>
    // <DragDropContext onDragEnd={onDragEnd}>
    //     <Table
    //       playerN={playerN}
    //       gameBroadcast={gameBroadcast}
    //       chatBroadcast={chatBroadcast}
    //       setTyping={setTyping}
    //     />
    // </DragDropContext>
    //   </ArcherContainer>
  )
});