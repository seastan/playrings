// A little function to help us with reordering the result
const Reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export const reorderGroupStackIds = (groupById, orig, dest) => {
  const origGroupStackIds = groupById[orig.droppableId].stackIds;
  const destGroupStackIds = groupById[dest.droppableId].stackIds;
  const stack = origGroupStackIds[orig.index];
  const stackId = stack.id;

  // Moving to same list
  if (orig.droppableId === dest.droppableId) {
    const reorderedStackIds = Reorder(origGroupStackIds, orig.index, dest.index);
    const newGroupById = {
      ...groupById,
      [orig.droppableId]: {
        ...groupById[orig.droppableId],
        stackIds: reorderedStackIds
      }
    };
    return newGroupById;
  }

  // Moving to different list

  // Remove from original
  const newOrigGroupStackIds = Array.from(origGroupStackIds);
  newOrigGroupStackIds.splice(orig.index, 1);
  // Insert into next
  const newDestGroupStackIds = Array.from(destGroupStackIds);
  newDestGroupStackIds.splice(dest.index, 0, stack);

  const newGroupById = {
    ...groupById,
    [orig.droppableId]: {
      ...groupById[orig.droppableId],
      stackIds: newOrigGroupStackIds,
    },
    [dest.droppableId]: {
      ...groupById[dest.droppableId],
      stackIds: newDestGroupStackIds,
    }
  };

  return newGroupById;
};
