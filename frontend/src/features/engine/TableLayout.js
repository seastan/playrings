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
  const layoutVariants = useSelector(state => state?.gameUi?.game?.layoutVariants);
  const [chatHover, setChatHover] = useState(false);
  const layout = useLayout();
  const numRows = layout.length;
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
            registerDivToArrowsContext={registerDivToArrowsContext}
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
      </div>
    </>
  )
})
