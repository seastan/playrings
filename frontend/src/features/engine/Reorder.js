import { get } from "http";

// A little function to help us with reordering the result
const Reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export const getGroupIdAndRegionType = (droppableId) => {
  if (!droppableId) return [null, null, null];
  // Split the droppableId to get the groupId and regionType: "groupId--regionType" -> ["groupId", "regionType"]
  const split = droppableId.split("--");
  return split;
};

export const reorderGroupStackIds = (groupById, orig, dest) => {
  const origGroupId = getGroupIdAndRegionType(orig.droppableId)[0];
  const destGroupId = getGroupIdAndRegionType(dest.droppableId)[0];
  const origGroupStackIds = groupById[origGroupId].stackIds;
  const destGroupStackIds = groupById[destGroupId].stackIds;
  const stack = origGroupStackIds[orig.index];
  const stackId = stack.id;

  // Moving to same list
  if (origGroupId === destGroupId) {
    const reorderedStackIds = Reorder(origGroupStackIds, orig.index, dest.index);
    const newGroupById = {
      ...groupById,
      [origGroupId]: {
        ...groupById[origGroupId],
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
    [origGroupId]: {
      ...groupById[origGroupId],
      stackIds: newOrigGroupStackIds,
    },
    [destGroupId]: {
      ...groupById[destGroupId],
      stackIds: newDestGroupStackIds,
    }
  };

  return newGroupById;
};
