import React from "react";
import { useSelector } from 'react-redux';
import { Browse } from "./Browse";
import "../../css/custom-misc.css"; 
import { TableRegion } from "./TableRegion";
import { useLayout } from "./hooks/useLayout";
import { useDoActionList } from "./hooks/useDoActionList";
import { useGameL10n } from "./hooks/useGameL10n";
import { TableChat } from "./TableChat";
import { TableButton } from "./TableButton";

export const TableLayout = React.memo(({addDroppableRef}) => {
  const gameL10n = useGameL10n();
  console.log("Rendering TableLayout");
  const sideGroupId = useSelector(state => state?.playerUi?.sideGroupId);
  const layoutVariants = useSelector(state => state?.gameUi?.game?.layoutVariants);
  const layout = useLayout();
  const numRows = layout.length;
  const doActionList = useDoActionList();  

  if (!layout) return;

  var middleRowsWidth = 100;
  if (sideGroupId !== "") {
    if (numRows >= 6) middleRowsWidth = 93;
    else middleRowsWidth = 91;
  }

  return (
    <>
      <Browse/>
      {layout.regions.map((region, regionIndex) => {
        if (region?.layoutVariants) {
          const variantVisible = () => {
            for (const [key, value] of Object.entries(region?.layoutVariants)) {
              if (layoutVariants?.[key] !== value) {
                return false;
              }
            }
            return true;
          }
          if (!variantVisible()) return;
        }
        return(
          <TableRegion
            key={regionIndex}
            region={region}
            addDroppableRef={addDroppableRef}
          />
        )
      })}
      {layout.tableButtons.map((tableButton, buttonIndex) => {        
        if (tableButton?.layoutVariants) {
          const variantVisible = () => {
            for (const [key, value] of Object.entries(tableButton?.layoutVariants)) {
              if (layoutVariants?.[key] !== value) {
                return false;
              }
            }
            return true;
          }
          if (!variantVisible()) return;
        }
        return(
          <TableButton 
            tableButton={tableButton}
          />
        )
      })}
      <TableChat region={layout.chat}/>

    </>
  )
})
