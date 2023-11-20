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
import { TextBox } from "./TextBox";
import { Prompts } from "./Prompts";

export const TableLayout = React.memo(({addDroppableRef}) => {
  const gameL10n = useGameL10n();
  console.log("Rendering TableLayout");
  const sideGroupId = useSelector(state => state?.playerUi?.sideGroupId);
  const layoutVariants = useSelector(state => state?.gameUi?.game?.layoutVariants);
  const textBoxById = useSelector(state => state?.gameUi?.game?.textBoxById);
  const layout = useLayout();
  const numRows = layout.length;
  const doActionList = useDoActionList();  

  if (!layout) return;

  var middleRowsWidth = 100;
  if (sideGroupId !== "") {
    if (numRows >= 6) middleRowsWidth = 93;
    else middleRowsWidth = 91;
  }

  const regionVisible = (region) => {
    if (region?.layoutVariants) {
      for (const [key, value] of Object.entries(region?.layoutVariants)) {
        if (layoutVariants?.[key] !== value) {
          return false;
        }
      }
    }
    return true;
  }

  return (
    <>
      <Browse addDroppableRef={addDroppableRef}/>
      {layout.regions?.map((region, regionIndex) => {
        if (region?.layoutVariants && !regionVisible(region)) return;
        return(
          <TableRegion
            key={regionIndex}
            region={region}
            addDroppableRef={addDroppableRef}
          />
        )
      })}
      {/* Table Buttons */}
      {layout.tableButtons?.map((tableButton, buttonIndex) => {        
        if (tableButton?.layoutVariants && !regionVisible(tableButton)) return;
        return(
          <TableButton 
            tableButton={tableButton}
          />
        )
      })}
      {/* Text Boxes */}
      {layout.textBoxes?.map((textBoxLayoutInfo, index) => {
        if (textBoxLayoutInfo?.layoutVariants && !regionVisible(textBoxLayoutInfo)) return;
        return(
          <TextBox textBoxLayoutInfo={textBoxLayoutInfo}/>
        )
      })}
      <TableChat region={layout.chat}/>
      <Prompts/>

    </>
  )
})
