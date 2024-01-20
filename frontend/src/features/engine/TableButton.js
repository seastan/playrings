import React from "react";
import { convertToPercentage } from "./functions/common";
import { useDoActionList } from "./hooks/useDoActionList";
import { useGameL10n } from "./hooks/useGameL10n";


export const TableButton = React.memo(({
  tableButton
}) => {
  const doActionList = useDoActionList();
  const gameL10n = useGameL10n();
  return (
    <div 
      className="absolute flex cursor-pointer border border-gray-500 justify-center items-center text-gray-400 bg-gray-700 hover:bg-gray-500" 
      style={{
        left: convertToPercentage(tableButton.left), 
        top: convertToPercentage(tableButton.top), 
        width: convertToPercentage(tableButton.width), 
        height: convertToPercentage(tableButton.height),
        zIndex: 1e3,
      }}
      onClick={() => {doActionList(tableButton?.actionList)}}>
      {gameL10n(tableButton.label)}
    </div>
  )
})