import React, { Component } from "react";
import styled from "@emotion/styled";
import Stacks from "./Stacks";
import Title from "./Title";
import { borderRadius, grid } from "./Constants";

const Container = styled.div`
  margin: ${grid}px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: ${borderRadius}px;
  border-top-right-radius: ${borderRadius}px;
  background-color: ${({ isDragging }) => (isDragging ? "green" : "gray")};
  transition: background-color 0.2s ease;
  &:hover {
    background-color: "green";
  }
`;

export default class Group extends Component {
  render() {
    const title = this.props.title;
    const group = this.props.group;
    const stacks = group.stacks;
    return (
      // <Draggable draggableId={title} index={index}>
      //   {(provided, snapshot) => (ref={provided.innerRef} {...provided.draggableProps}>
      <Container>
        <Header>
          <Title aria-label={`${title} quote list`}>{title}</Title>
        </Header>
        <Stacks
          stacks={stacks}
          listId={title}
          listType="QUOTE"
          internalScroll={this.props.isScrollable}
          isCombineEnabled={Boolean(this.props.isCombineEnabled)}
        />
      </Container>
      //   )}
      // </Draggable>
    );
  }
}