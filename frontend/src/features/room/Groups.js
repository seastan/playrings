import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { generateQuoteMap } from "./data";
import styled from "@emotion/styled";
import Group from "./Group";
import Reorder, { reorderQuoteMap } from "./Reorder";
import { DragDropContext } from "react-beautiful-dnd";

const data = {
  small: generateQuoteMap(10),
  medium: generateQuoteMap(100),
  large: generateQuoteMap(250)
};

const Container = styled.div`
  min-height: 100vh;
  /* like display:flex but will allow bleeding over the window width */
  min-width: 100vw;
  /* display: inline-flex; */
`;

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

  const [state,setState] = useState({
    columns: data.large,
    ordered: Object.keys(data.medium)
  });

  // const onDragEnd = (result) => {
  //   console.log(result);
  //   if (!result.destination) return;
  //   const { source, destination } = result;
  //   var newGroups = {};
  //   if (source.droppableId !== destination.droppableId) {
  //     const sourceGroup = groups[source.droppableId];
  //     const destGroup = groups[destination.droppableId];
  //     const sourceStacks = [...sourceGroup.stacks];
  //     const destStacks = [...destGroup.stacks];
  //     const [removed] = sourceStacks.splice(source.index, 1);
  //     destStacks.splice(destination.index, 0, removed);
  //     newGroups = {
  //       ...groups,
  //       [source.droppableId]: {
  //         ...sourceGroup,
  //         stacks: sourceStacks
  //       },
  //       [destination.droppableId]: {
  //         ...destGroup,
  //         stacks: destStacks
  //       }
  //     }
  //   } else {
  //     const group = groups[source.droppableId];
  //     const copiedStacks = [...group.stacks];
  //     const [removed] = copiedStacks.splice(source.index, 1);
  //     copiedStacks.splice(destination.index, 0, removed);
  //     newGroups = {
  //       ...groups,
  //       [source.droppableId]: {
  //         ...group,
  //         stacks: copiedStacks
  //       }
  //     }
  //   }
  //   setGroups(newGroups);
  //   broadcast("update_groups",{groups: newGroups});
  // };

  const onDragEnd = (result) => {
    if (result.combine) {
      const column = state.columns[result.source.droppableId];
      const withQuoteRemoved = [...column];
      withQuoteRemoved.splice(result.source.index, 1);
      const columns = {
        ...state.columns,
        [result.source.droppableId]: withQuoteRemoved
      };
      setState({ columns, ordered: state.ordered });
      return;
    }

    // dropped nowhere
    if (!result.destination) {
      return;
    }
    console.log(result);
    const source = result.source;
    const destination = result.destination;

    // did not move anywhere - can bail early
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    console.log('here');
    const data = reorderQuoteMap({
      quoteMap: state.columns,
      source,
      destination
    });

    setState({
      columns: data.quoteMap,
      ordered: state.ordered
    });
  };

  const columns = state.columns;
  const ordered = state.ordered;
  console.log('ordered');
  console.log(ordered);
  // const {
  //   containerHeight,
  //   useClone,
  //   isCombineEnabled,
  //   withScrollableColumns
  // } = props;

  const board = (

    <Container>
      <Group
        group={groups['gSharedQuestDeck']}
        key={'gSharedQuestDeck'}
        title={groups['gSharedQuestDeck'].id}
        isCombineEnabled={true}
      />
      <Group
        group={groups['gSharedEncounterDeck']}
        key={'gSharedEncounterDeck'}
        title={groups['gSharedEncounterDeck'].id}
        isCombineEnabled={true}
      />
      
    </Container>
  );

  return (
    <React.Fragment>
      <DragDropContext onDragEnd={onDragEnd}>
        {board}
      </DragDropContext>
    </React.Fragment>
  );
}
