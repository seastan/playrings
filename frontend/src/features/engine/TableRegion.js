import React from "react";
import { useSelector } from 'react-redux';
import { Group } from "./Group";

export const TableRegion = React.memo(({
  region
}) => {
  console.log("Rendering TableRegion", region);
  const observingPlayerN = useSelector(state => state?.playerUi?.observingPlayerN);
  const browseGroupId = useSelector(state => state?.playerUi?.browseGroup?.id);
  const formattedGroupId = region.groupId.replace(/playerN/g, observingPlayerN);
  const formattedRegion = {...region, groupId: formattedGroupId};
  const hideGroup = (formattedRegion.groupId === browseGroupId) || (browseGroupId && formattedRegion.hideWhileBrowsing);
  console.log("hidegroup", formattedRegion, browseGroupId, hideGroup);
  return (
    <div
      className="absolute"
      style={{
        ...region?.style,
        top: region.top,
        left: region.left,
        width: region.width,
        height: region.height,
        MozBoxShadow: (region.boxShadow) ? '0 10px 10px 5px rgba(0,0,0,0.3)' : "",
        WebkitBoxShadow: (region.boxShadow) ? '0 10px 10px 5px rgba(0,0,0,0.3)' : "",
        boxShadow: (region.boxShadow) ? '0 10px 10px 5px rgba(0,0,0,0.3)' : ""
      }}>
      {hideGroup ? null :
        <Group
          groupId={formattedGroupId}
          region={formattedRegion}
        />
      }
    </div>
  )
})