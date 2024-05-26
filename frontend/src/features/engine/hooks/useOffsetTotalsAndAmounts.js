import { useSelector } from "react-redux";


export const useOffsetTotalsAndAmounts = (stackId) => {
    const stack = useSelector(state => state?.gameUi?.game?.stackById[stackId]);
    const cardIds = stack?.cardIds;
    const attachmentDirections = useSelector(state => cardIds.map(cardId => state?.gameUi?.game?.cardById[cardId].attachmentDirection));

    if (!stack) return {offsetTotals: {top: 0, left: 0, right: 0, bottom: 0, behind: 0}, offsetAmounts: [{top: 0, left: 0}]};
    const offsetTotals = {top: 0, left: 0, right: 0, bottom: 0, behind: 0};
    const offsetAmounts = [{top: 0, left: 0}];
    for (var i = 1; i<cardIds.length; i++) {
      const attachmentDirection = attachmentDirections[i];
      if (attachmentDirection === "left") {
        offsetTotals.left++;
        offsetAmounts.push({top: 0, left: -offsetTotals.left});
      } else if (attachmentDirection === "top") {
        offsetTotals.top++;
        offsetAmounts.push({top: -offsetTotals.top, left: 0});
      } else if (attachmentDirection === "bottom") {
        offsetTotals.bottom++;
        offsetAmounts.push({top: offsetTotals.bottom, left: 0});
      } else if (attachmentDirection === "behind") {
        offsetTotals.behind++;
        offsetAmounts.push({top: 0, left: 0});
      } else {
        offsetTotals.right++;
        offsetAmounts.push({top: 0, left: offsetTotals.right});
      } 
    }
    // Add the left and top offsetTotals to each offsetAmount
    offsetAmounts.forEach((offsetAmount, index) => {
      offsetAmount.top += offsetTotals.top;
      offsetAmount.left += offsetTotals.left;
    });
    return {offsetTotals, offsetAmounts};
  }
  