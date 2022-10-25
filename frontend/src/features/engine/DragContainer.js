
import React, { useContext } from "react";
import { ArrowsBetweenDivsContextProvider, ArrowBetweenDivs, LineOrientation, ArrowAnchorPlacement } from 'react-simple-arrows';
import { DragDropContext } from "react-beautiful-dnd";
import { useSelector, useDispatch } from 'react-redux';
import { setStackIds, setCardIds, setGroupById, setValues } from "../store/gameUiSlice";
import { reorderGroupStackIds } from "./Reorder";
import store from "../../store";
import { setTouchAction } from "../store/playerUiSlice";
import { getDisplayName, getDisplayNameFlipped } from "../plugins/lotrlcg/functions/helpers";
import { Table } from "./Table";
import BroadcastContext from "../../contexts/BroadcastContext";
import { useGameDefinition } from "./functions/useGameDefinition";
import { useDoActionList } from "./functions/useDoActionList";

export const DragContainer = React.memo(({}) => {
  console.log("Rendering DragContainer");
  const dispatch = useDispatch();
  const gameDef = useGameDefinition();
  const doActionList = useDoActionList();
  const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
  const playerData = useSelector(state => state?.gameUi?.game?.playerData);
  const touchMode = useSelector(state => state?.playerUi?.touchMode);
  //const archerContainerRef = React.createRef();
  const arrowColors = ["rgba(255,0,0,0.6)", "rgba(0,200,0,0.6)", "rgba(0,128,255,0.6)", "rgba(128,0,255,0.6)"];

  const arrows1 = playerData.player1.arrows;
  const arrows2 = playerData.player2.arrows;
  const arrows3 = playerData.player3.arrows;
  const arrows4 = playerData.player4.arrows;
  const usingArrows = (arrows1 && arrows1.length) || (arrows2 && arrows2.length) || (arrows3 && arrows3.length) || (arrows4 && arrows4.length);

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
      if ((origGroup.type === "hand" || origGroup.type === "deck" ) && (destGroup.type !== "hand" && destGroup.type !== "deck" )) {
        chatBroadcast("game_update",{message: "attached "+getDisplayNameFlipped(topOfOrigStackCard)+" from "+gameDef.groups[origGroupId].name+" to "+getDisplayName(topOfDestStackCard)+" in "+gameDef.groups[destGroupId].name+"."})
        // Flip card faceup
        const updates = [["cardById",topOfOrigStackCardId,"currentSide", "A"]];
        dispatch(setValues({updates: updates}));
      } else {
        chatBroadcast("game_update",{message: "attached "+getDisplayName(topOfOrigStackCard)+" from "+gameDef.groups[origGroupId].name+" to "+getDisplayName(topOfDestStackCard)+" in "+gameDef.groups[destGroupId].name+"."});
      }
      dispatch(setStackIds(newOrigGroup));
      dispatch(setCardIds(newDestStack));
      doActionList(["MOVE_STACK", origStackId, destGroupId, dest.index, true, false])
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
      console.log("draginfo", origGroupId)
      console.log("draginfo", gameDef.groups[origGroupId])
      console.log("draginfo", destGroupId)
      console.log("draginfo", gameDef.groups[destGroupId])
      console.log("draginfo", gameDef.groups[destGroupId])
      // Moved to a different spot
      const newGroupById = reorderGroupStackIds(groupById, orig, dest);
      const origGroupTitle = gameDef.groups[origGroupId].name;
      const destGroupTitle = gameDef.groups[destGroupId].name;
      if (!origGroup.inPlay && destGroup.inPlay) {
        chatBroadcast("game_update",{message: "moved "+getDisplayNameFlipped(topOfOrigStackCard)+" from "+origGroupTitle+" to "+destGroupTitle+"."});
        // Flip card faceup
        const updates = [["game", "cardById",topOfOrigStackCardId,"currentSide", "A"]];
        console.log("draginfo", updates)
        dispatch(setValues({updates: updates}));
      }
      else {
        chatBroadcast("game_update",{message: "moved "+getDisplayName(topOfOrigStackCard)+" from "+origGroupTitle+" to "+destGroupTitle+"."});
      }
      doActionList(["MOVE_STACK", origStackId, destGroupId, dest.index, false, destGroupId === origGroupId])
      dispatch(setGroupById(newGroupById));
      //gameBroadcast("game_action", {action:"move_stack", options:{stack_id: origStackId, dest_group_id: destGroupId, dest_stack_index: dest.index, combine: false, preserve_state: destGroupId === origGroupId}})
    }
    if (touchMode && origGroup.type === "hand" && destGroup.type === "play") {
      const cost = topOfOrigStackCard.sides.A.cost;
      if (cost) dispatch(setTouchAction({action: "increment_token", options:{tokenType: "resource", "increment": -1, tokensLeft: cost}, type: "card"}));
    }
  }

  return(
    <DragDropContext onDragEnd={onDragEnd}>
      <ArrowsBetweenDivsContextProvider>
        {({ registerDivToArrowsContext }) => (
          <>
            {Object.keys(playerData).map((playerI, playerIndex) => {
              return(
                playerData[playerI].arrows.map((arrowStartStop, arrowIndex) => {
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
    //       setTyping={setTyping}
    //     />
    // </DragDropContext>
    //   </ArcherContainer>
  )
});