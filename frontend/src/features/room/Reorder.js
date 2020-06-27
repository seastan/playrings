// @flow

// a little function to help us with reordering the result
const Reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export default Reorder;

export const reorderGroups = ({ groups, source, destination }) => {
  const current = groups[source.droppableId].stacks;
  const next = groups[destination.droppableId].stacks;
  const target = current[source.index];

  // moving to same list
  if (source.droppableId === destination.droppableId) {
    const reorderedStacks = Reorder(current, source.index, destination.index);
    const result = {
      ...groups,
      [source.droppableId]: {
        ...groups[source.droppableId],
        stacks: reorderedStacks
      }
    };
    return {
      groups: result
    };
  }

  // moving to different list

  // remove from original
  const newCurrent = Array.from(current);
  newCurrent.splice(source.index, 1);
  // insert into next
  const newNext = Array.from(next);
  newNext.splice(destination.index, 0, target);

  const result = {
    ...groups,
    [source.droppableId]: {
      ...groups[source.droppableId],
      stacks: newCurrent,
    },
    [destination.droppableId]: {
      ...groups[destination.droppableId],
      stacks: newNext,
    }
  };

  return {
    groups: result
  };
};

export function moveBetween({ list1, list2, source, destination }) {
  const newFirst = Array.from(list1.values);
  const newSecond = Array.from(list2.values);

  const moveFrom = source.droppableId === list1.id ? newFirst : newSecond;
  const moveTo = moveFrom === newFirst ? newSecond : newFirst;

  const [moved] = moveFrom.splice(source.index, 1);
  moveTo.splice(destination.index, 0, moved);

  return {
    list1: {
      ...list1,
      values: newFirst
    },
    list2: {
      ...list2,
      values: newSecond
    }
  };
}
