import React, { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Group } from "./Group";
import { Browse } from "./Browse";
import { CARDSCALE, LAYOUTINFO } from "../plugin/Constants";
import Chat from "../chat/Chat";
import "../../css/custom-misc.css"; 
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { QuickAccess } from "./QuickAccess";
import { SideGroup } from "./SideGroup";
import { setCardSize } from "../store/playerUiSlice";

var delayBroadcast;

export const TableRegion = React.memo(({
  region,
  cardSize,
  gameBroadcast,
  chatBroadcast,
  registerDivToArrowsContext,
}) => {
  const observingPlayerN = useSelector(state => state?.playerUi?.observingPlayerN);
  const browseGroupId = useSelector(state => state?.playerUi?.browseGroup?.id);
  const groupId = ["Hand", "Deck", "Discard"].includes(region.id) ? observingPlayerN + region.id : region.id;
  const beingBrowsed = groupId === browseGroupId;
  return (
    <div
      className="h-full float-left"
      style={{
        width: region.width,
        padding: "0 0 0 0.5vw",
        background: (region.style === "shaded") ? "rgba(0, 0, 0, 0.3)" : "",
        MozBoxShadow: (region.boxShadow) ? '0 10px 10px 5px rgba(0,0,0,0.3)' : "",
        WebkitBoxShadow: (region.boxShadow) ? '0 10px 10px 5px rgba(0,0,0,0.3)' : "",
        boxShadow: (region.boxShadow) ? '0 10px 10px 5px rgba(0,0,0,0.3)' : "",
      }}
    >
      {beingBrowsed ? null :
        <Group
          groupId={groupId}
          cardSize={cardSize}
          gameBroadcast={gameBroadcast} 
          chatBroadcast={chatBroadcast}
          hideTitle={region.hideTitle}
          registerDivToArrowsContext={registerDivToArrowsContext}
        />
      }
    </div>
  )
})

export const TableLayout = React.memo(({
  gameBroadcast,
  chatBroadcast,
  registerDivToArrowsContext,
}) => {
  console.log("Rendering TableLayout");
  const dispatch = useDispatch();
  const numPlayers = useSelector(state => state?.gameUi?.game?.numPlayers);
  const layout = useSelector(state => state?.gameUi?.game?.layout);
  const cardSizeFactor = useSelector(state => state?.playerUi?.cardSizeFactor);
  const sideGroupId = useSelector(state => state?.playerUi?.sideGroupId);
  const browseGroupId = useSelector(state => state?.playerUi?.browseGroup?.id);
  const [chatHover, setChatHover] = useState(false);
  const { height, width } = useWindowDimensions();
  const aspectRatio = width/height;
  console.log("browseGroupId",browseGroupId)

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

  const layoutInfo = LAYOUTINFO["layout" + numPlayers + layout];
  const numRows = layoutInfo.length;
  const rowHeight = `${100/numRows}%`; 
  var cardSize = CARDSCALE/numRows;
  if (aspectRatio < 1.9) cardSize = cardSize*(1-0.75*(1.9-aspectRatio));
  cardSize = cardSize*cardSizeFactor;
  dispatch(setCardSize(cardSize));

  var middleRowsWidth = 100;
  if (sideGroupId !== "") {
    if (numRows >= 6) middleRowsWidth = 93;
    else middleRowsWidth = 91;
  }

  return (
    <>
      {/* Top row */}
      <div 
        className="relative w-full" 
        style={{height: rowHeight}}>
        {layoutInfo[0].regions.map((region, _regionIndex) => (
          <TableRegion
            region={region}
            gameBroadcast={gameBroadcast} 
            chatBroadcast={chatBroadcast}
            registerDivToArrowsContext={registerDivToArrowsContext}
          />
        ))}
      </div>
      {/* Middle rows */}
      <div 
        className="relative float-left"
        style={{height: `${100-2*(100/numRows)}%`, width:`${middleRowsWidth}%`}}>
        {layoutInfo.map((row, rowIndex) => {  
          if (browseGroupId && rowIndex === numRows - 2) {
            return(
            <div 
              className="relative bg-gray-700 rounded-lg w-full" 
              style={{height: `${100/(numRows-2)}%`}}>
              <Browse
                groupId={browseGroupId}
                gameBroadcast={gameBroadcast}
                chatBroadcast={chatBroadcast}/>
              </div>
            )
          } else if (rowIndex > 0 && rowIndex < numRows - 1) {
            return(
              <div 
                className="relative w-full" 
                style={{height: `${100/(numRows-2)}%`}}>
                {row.regions.map((region, _regionIndex) => (
                  <TableRegion
                    region={region}
                    gameBroadcast={gameBroadcast} 
                    chatBroadcast={chatBroadcast}
                    registerDivToArrowsContext={registerDivToArrowsContext}
                  />
                ))}
              </div>
            )
          } else return null;
        })}
      </div>
      <SideGroup
        gameBroadcast={gameBroadcast}
        chatBroadcast={chatBroadcast}
        registerDivToArrowsContext={registerDivToArrowsContext}/>
      {/* Bottom row */}
      <div 
        className="relative float-left w-full" 
        style={{height: rowHeight}}>
        {layoutInfo[numRows-1].regions.map((region, _regionIndex) => (
          <TableRegion
            region={region}
            gameBroadcast={gameBroadcast} 
            chatBroadcast={chatBroadcast}
            registerDivToArrowsContext={registerDivToArrowsContext}
          />
        ))}
      </div>
      {/* Quickview and Chat */}
      <div className="absolute right-0 bottom-0 h-full" style={{width:"25%", height: rowHeight}}>
        <div 
          className="absolute bottom-0 left-0" 
          style={{height: chatHover ? `${numRows*100}%` : `100%`, width:'100%', paddingRight:"30px", opacity: 0.7, zIndex: chatHover ? 1e6 : 1e3}}
          onMouseEnter={() => handleStartChatHover()}
          onMouseLeave={() => handleStopChatHover()}>
          <Chat hover={chatHover} chatBroadcast={chatBroadcast}/>
        </div>
        <QuickAccess/>
      </div>
    </>
  )
})
