import React from "react";
import { useSelector } from 'react-redux';
import { Group } from "./Group";
import { convertToPercentage } from "./functions/common";
import { usePlayerN } from "./hooks/usePlayerN";
import { useFormatGroupId } from "./hooks/useFormatGroupId";


export const TableRegion = React.memo(({
  region,
  onDragEnd
}) => {
  console.log("Rendering TableRegion", region);
  const playerN = usePlayerN();
  const formatGroupId = useFormatGroupId();
  const browseGroupId = useSelector(state => state?.gameUi?.game?.playerData?.[playerN]?.browseGroup?.id);
  const formattedGroupId = formatGroupId(region.groupId);
  const extraStyle = useSelector(state => state?.gameUi?.game?.groupById?.[formattedGroupId]?.extraStyle);
  const formattedRegion = {...region, groupId: formattedGroupId};
  const hideGroup = (formattedRegion.groupId === browseGroupId) || (browseGroupId && formattedRegion.hideWhileBrowsing);
  return (
    <div
      className="absolute"
      style={{
        ...region?.style,
        ...extraStyle,
        top: convertToPercentage(region.top),
        left: convertToPercentage(region.left),
        width: convertToPercentage(region.width),
        height: convertToPercentage(region.height),
        MozBoxShadow: (region.boxShadow) ? '0 10px 10px 5px rgba(0,0,0,0.3)' : "",
        WebkitBoxShadow: (region.boxShadow) ? '0 10px 10px 5px rgba(0,0,0,0.3)' : "",
        boxShadow: (region.boxShadow) ? '0 10px 10px 5px rgba(0,0,0,0.3)' : ""
      }}>
      {hideGroup ? null :
        <Group
          groupId={formattedGroupId}
          region={formattedRegion}
          onDragEnd={onDragEnd}
        />
      }
    </div>
  )
})