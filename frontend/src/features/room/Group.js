import React, { Component } from "react";
import styled from "@emotion/styled";
import Stacks from "./Stacks";
import Title from "./Title";
import { borderRadius, grid } from "./Constants";

const Container = styled.div`
  padding: 1px 1px 1px 1px;
  max-height: 100%;
  height: 100%;
  width: 100%;
`;

const Header = styled.div`
  align-items: center;
  justify-content: center;
  color: white;
  height: 13%;
`;

export default class Group extends Component {
  render() {
    const broadcast = this.props.broadcast;
    const group = this.props.group;
    const title = this.props.title;
    const stacks = group.stacks;
    const activeCard = this.props.activeCard;
    const setActiveCard= this.props.setActiveCard;
    return (
      // <Draggable draggableId={title} index={index}>
      //   {(provided, snapshot) => (ref={provided.innerRef} {...provided.draggableProps}>
      <Container>
        <Header>
          <Title>{group.name}</Title>
        </Header>
        <Stacks
          broadcast={broadcast}
          group={group}
          stacks={stacks}
          internalScroll={this.props.isScrollable}
          isCombineEnabled={group.type === "play"}
          activeCard={activeCard}
          setActiveCard={setActiveCard}
        />
      </Container>
      //   )}
      // </Draggable>
    );
  }
}