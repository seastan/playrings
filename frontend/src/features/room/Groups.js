import React, { Component, useState } from "react";
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

const ParentContainer = styled.div`
  height: ${({ height }) => height};
  overflow-x: hidden;
  overflow-y: auto;
`;

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
  /* eslint-disable react/sort-comp */
  const defaultProps = {
    isCombineEnabled: true
  };

  const [state,setState] = useState({
    columns: data.large,
    ordered: Object.keys(data.medium)
  });

  const onDragEnd = (result) => {
    console.log(result);
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
    // <Droppable
    //   droppableId="board"
    //   type="COLUMN"
    //   ignoreContainerClipping={Boolean(containerHeight)}
    //   isCombineEnabled={isCombineEnabled}
    // >
    //   {provided => (ref={provided.innerRef} {...provided.droppableProps}>
    <Container>
      {ordered.map((key, index) => (
        <Group
          key={key}
          index={index}
          title={key}
          quotes={columns[key]}
          //isScrollable={withScrollableColumns}
          isCombineEnabled={true}
          //useClone={useClone}
        />
      ))}
      {/* {provided.placeholder} */}
    </Container>
    //   )}
    // </Droppable>
  );

  return (
    <React.Fragment>
      <DragDropContext onDragEnd={onDragEnd}>
        {board}
      </DragDropContext>
    </React.Fragment>
  );
}
