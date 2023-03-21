import React, { useContext, useState } from "react";
import { useSelector } from 'react-redux';
import { Browse } from "./Browse";
import MessageBox from "../messages/MessageBox";
import "../../css/custom-misc.css"; 
import BroadcastContext from "../../contexts/BroadcastContext";
import { TableRegion } from "./TableRegion";
import { useLayout } from "./functions/useLayout";
import { useDoActionList } from "./functions/useDoActionList";

var delayBroadcast;

export const TableLayout = React.memo(({
  registerDivToArrowsContext,
}) => {
  const {gameBroadcast, chatBroadcast} = useContext(BroadcastContext);
  console.log("Rendering TableLayout");
  const sideGroupId = useSelector(state => state?.playerUi?.sideGroupId);
  const browseGroupId = useSelector(state => state?.playerUi?.browseGroup?.id);
  const layoutVariants = useSelector(state => state?.gameUi?.game?.layoutVariants);
  const [chatHover, setChatHover] = useState(false);
  const layout = useLayout();
  const numRows = layout.length;
  const rowHeight = `${100/numRows}%`; 
  const doActionList = useDoActionList();
  

  if (!layout) return;

  const handleStartChatHover = () => {
    if (delayBroadcast) clearTimeout(delayBroadcast);
    delayBroadcast = setTimeout(function() {
        setChatHover(true);
    }, 1000);
  }
  const handleStopChatHover = () => {
    if (delayBroadcast) clearTimeout(delayBroadcast);
    setChatHover(false);
  }

  var middleRowsWidth = 100;
  if (sideGroupId !== "") {
    if (numRows >= 6) middleRowsWidth = 93;
    else middleRowsWidth = 91;
  }

  return (
    <>
      <Browse/>
      {layout.regions.map((region, regionIndex) => {
        console.log("layoutId", region.groupId, layout?.layoutVariant )
        if (region?.layoutVariants) {
          const variantVisible = () => {
            for (const [key, value] of Object.entries(region?.layoutVariants)) {
              console.log("layoutId", layoutVariants, key, value)
              if (layoutVariants?.[key] == value) {
                return true;
              }
            }
            return false;
          }
          if (!variantVisible()) return;
        }
        return(
          <TableRegion
            key={regionIndex}
            region={region}
            registerDivToArrowsContext={registerDivToArrowsContext}
          />
        )
      })}
      {layout.tableButtons.map((tableButton, buttonIndex) => {
        return(
          <div 
            className="absolute flex cursor-pointer border border-gray-500 justify-center items-center text-gray-400 bg-gray-700 hover:bg-gray-500" style={{left: tableButton.left, top: tableButton.top, width: tableButton.width, height: tableButton.height}}
            onClick={() => {doActionList(tableButton?.actionListId)}}>
            {tableButton.text}
          </div>
        )
      })}
      <div className="absolute" style={{left: layout.chat.left, top: layout.chat.top, width: layout.chat.width, height: layout.chat.height}}>
        <div 
          className="absolute bottom-0 left-0" 
          style={{height: chatHover ? "100vh" : "100%", width:'100%', opacity: 0.7, zIndex: chatHover ? 1e6 : 1e3}}
          onMouseEnter={() => handleStartChatHover()}
          onMouseLeave={() => handleStopChatHover()}>
          <MessageBox hover={chatHover} chatBroadcast={chatBroadcast}/>
        </div>
        {/* <QuickAccess/> */}
      </div>
      {/* Top row
      <div 
        className="relative w-full" 
        style={{height: rowHeight}}>
        {layout[0].regions.map((region, regionIndex) => (
          <TableRegion
            key={regionIndex}
            region={region}
            registerDivToArrowsContext={registerDivToArrowsContext}
          />
        ))}
      </div>
      {/* Middle rows
      <div 
        className="relative float-left"
        style={{height: `${100-2*(100/numRows)}%`, width:`${middleRowsWidth}%`}}>
        {layout.map((row, rowIndex) => {  
          if (browseGroupId && rowIndex === numRows - 2) {
            return(
              <div 
                className="relative bg-gray-700 rounded-lg w-full" 
                style={{height: `${100/(numRows-2)}%`}}>
                <Browse
                  groupId={browseGroupId}/>
              </div>
            )
          } else if (rowIndex > 0 && rowIndex < numRows - 1) {
            return(
              <div 
                key={rowIndex}
                className="relative w-full" 
                style={{height: `${100/(numRows-2)}%`}}>
                {row.regions.map((region, regionIndex) => (
                  <TableRegion
                    key={regionIndex}
                    region={region}
                    registerDivToArrowsContext={registerDivToArrowsContext}
                  />
                ))}
              </div>
            )
          } else return null;
        })}
      </div>
      <SideGroup
        registerDivToArrowsContext={registerDivToArrowsContext}/>
      {/* Bottom row
      <div 
        className="relative float-left w-full" 
        style={{height: rowHeight}}>
        {layout[numRows-1].regions.map((region, regionIndex) => (
          <TableRegion
            key={regionIndex}
            region={region}
            registerDivToArrowsContext={registerDivToArrowsContext}
          />
        ))}
      </div> */}
    </>
  )
})
