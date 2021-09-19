import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { Group } from "./Group";
import { Stacks } from "./Stacks";
import { Browse } from "./Browse";
import { GROUPSINFO, CARDSCALE, LAYOUTINFO } from "./Constants";
import Chat from "../chat/Chat";
import "../../css/custom-misc.css"; 
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { useObservingPlayerN } from "../../contexts/ObservingPlayerNContext";
import { QuickAccess } from "./QuickAccess";
import { SideGroup } from "./SideGroup";

var delayBroadcast;

export const TableRegion = React.memo(({
  region,
  cardSize,
  gameBroadcast,
  chatBroadcast,
  playerN,
  browseGroupId,
  setBrowseGroupId,
  setBrowseGroupTopN,
  registerDivToArrowsContext,
}) => {
  const observingPlayerN = useObservingPlayerN();
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
          playerN={playerN}
          hideTitle={region.hideTitle}
          browseGroupId={browseGroupId}
          setBrowseGroupId={setBrowseGroupId}
          setBrowseGroupTopN={setBrowseGroupTopN}
          registerDivToArrowsContext={registerDivToArrowsContext}
        />
      }
    </div>
  )
})

export const TableLayout = React.memo(({
  gameBroadcast,
  chatBroadcast,
  playerN,
  setTyping,
  browseGroupId,
  setBrowseGroupId,
  browseGroupTopN,
  setBrowseGroupTopN,
  registerDivToArrowsContext,
  cardSizeFactor,
}) => {
  console.log("Rendering TableLayout");
  const numPlayersStore = state => state.gameUi.game.numPlayers;
  const numPlayers = useSelector(numPlayersStore);
  const groupByIdStore = state => state.gameUi.game.groupById;
  const groupById = useSelector(groupByIdStore);
  const layoutStore = state => state.gameUi?.game?.layout;
  const layout = useSelector(layoutStore);
  const observingPlayerN = useObservingPlayerN();
  const [chatHover, setChatHover] = useState(false);
  const [sideGroupId, setSideGroupId] = useState("sharedSetAside");
  const { height, width } = useWindowDimensions();
  const aspectRatio = width/height;

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

  cardSize = cardSize*cardSizeFactor/100;

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
            cardSize={cardSize}
            gameBroadcast={gameBroadcast} 
            chatBroadcast={chatBroadcast}
            playerN={playerN}
            browseGroupId={browseGroupId}
            setBrowseGroupId={setBrowseGroupId}
            setBrowseGroupTopN={setBrowseGroupTopN}
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
              style={{height: `${100/(numRows-2)}%`}}
            >
              <Browse
                groupId={browseGroupId}
                cardSize={cardSize}
                gameBroadcast={gameBroadcast}
                chatBroadcast={chatBroadcast}
                playerN={playerN}
                browseGroupTopN={browseGroupTopN}
                setBrowseGroupId={setBrowseGroupId}
                setBrowseGroupTopN={setBrowseGroupTopN}
                setTyping={setTyping}
              />
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
                    cardSize={cardSize}
                    gameBroadcast={gameBroadcast} 
                    chatBroadcast={chatBroadcast}
                    playerN={playerN}
                    browseGroupId={browseGroupId}
                    setBrowseGroupId={setBrowseGroupId}
                    setBrowseGroupTopN={setBrowseGroupTopN}
                    registerDivToArrowsContext={registerDivToArrowsContext}
                  />
                ))}
              </div>
            )
          }
        })}
      </div>
      <SideGroup
        gameBroadcast={gameBroadcast}
        chatBroadcast={chatBroadcast}
        playerN={playerN}
        browseGroupId={browseGroupId}
        registerDivToArrowsContext={registerDivToArrowsContext}
        cardSizeFactor={cardSizeFactor}
        sideGroupId={sideGroupId}/>
      {/* Bottom row */}
      <div 
        className="relative float-left w-full" 
        style={{height: rowHeight}}>
        {layoutInfo[numRows-1].regions.map((region, _regionIndex) => (
          <TableRegion
            region={region}
            cardSize={cardSize}
            gameBroadcast={gameBroadcast} 
            chatBroadcast={chatBroadcast}
            playerN={playerN}
            browseGroupId={browseGroupId}
            setBrowseGroupId={setBrowseGroupId}
            setBrowseGroupTopN={setBrowseGroupTopN}
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
          <Chat hover={chatHover} chatBroadcast={chatBroadcast} setTyping={setTyping}/>
        </div>
        <QuickAccess
          sideGroupId={sideGroupId}
          setSideGroupId={setSideGroupId}
        />
      </div>
    </>
  )
})
