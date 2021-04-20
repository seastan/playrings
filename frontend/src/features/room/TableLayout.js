import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { Group } from "./Group";
import { Browse } from "./Browse";
import { CARDSCALE, LAYOUTINFO } from "./Constants";
import Chat from "../chat/Chat";
 

export const TableRegion = React.memo(({
  region,
  cardSize,
  observingPlayerN,
  gameBroadcast,
  chatBroadcast,
  playerN,
  browseGroupId,
  setBrowseGroupId,
  setBrowseGroupTopN,
}) => {
  const groupId = ["Hand", "Deck", "Discard"].includes(region.id) ? observingPlayerN + region.id : region.id;
  const beingBrowsed = groupId === browseGroupId;
  return (
    <div
      className="h-full float-left"
      style={{
        width: region.width,
        padding: "0 0 0 0.5vw",
        background: (region.style == "shaded") ? "rgba(0, 0, 0, 0.3)" : "",
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
        />
      }
    </div>
  )
})

export const TableLayout = React.memo(({
  observingPlayerN,
  gameBroadcast,
  chatBroadcast,
  playerN,
  setTyping,
  browseGroupId,
  setBrowseGroupId,
  browseGroupTopN,
  setBrowseGroupTopN,
}) => {
  const numPlayersStore = state => state.gameUi.numPlayers;
  const numPlayers = useSelector(numPlayersStore);
  const layoutStore = state => state.gameUi.layout;
  const layout = useSelector(layoutStore);
  const [chatHover, setChatHover] = useState(false);
  if (!layout) return;
  const layoutInfo = LAYOUTINFO["layout" + numPlayers + layout];
  const numRows = layoutInfo.length;
  const rowHeight = 100/numRows; 
  const finalRowHeight = 100/numRows; 
  const cardSize = CARDSCALE/numRows;
  console.log("rendering layout");
  return (
    layoutInfo.map((row, rowIndex) => (
      (browseGroupId && rowIndex === numRows - 2) ? 
        <div 
          className="flex flex-1 bg-gray-700 border rounded-lg outline-none w-full" 
          style={{
            minHeight: (rowIndex === numRows - 1) ? `${finalRowHeight}%` : `${rowHeight}%`, 
            height:    (rowIndex === numRows - 1) ? `${finalRowHeight}%` : `${rowHeight}%`, 
            maxHeight: (rowIndex === numRows - 1) ? `${finalRowHeight}%` : `${rowHeight}%`,
          }}>
          <Browse
            groupId={browseGroupId}
            cardSize={cardSize}
            gameBroadcast={gameBroadcast}
            chatBroadcast={chatBroadcast}
            playerN={playerN}
            browseGroupTopN={browseGroupTopN}
            setBrowseGroupId={setBrowseGroupId}
            setBrowseGroupTopN={setBrowseGroupTopN}
          />
          </div>
        :
          <div 
            className="relative w-full" 
            style={{
              minHeight: (rowIndex === numRows - 1) ? `${finalRowHeight}%` : `${rowHeight}%`, 
              height:    (rowIndex === numRows - 1) ? `${finalRowHeight}%` : `${rowHeight}%`, 
              maxHeight: (rowIndex === numRows - 1) ? `${finalRowHeight}%` : `${rowHeight}%`,
            }}>
            {row.regions.map((region, regionIndex) => (
              <TableRegion
                region={region}
                cardSize={cardSize}
                observingPlayerN={observingPlayerN}
                gameBroadcast={gameBroadcast} 
                chatBroadcast={chatBroadcast}
                playerN={playerN}
                browseGroupId={browseGroupId}
                setBrowseGroupId={setBrowseGroupId}
                setBrowseGroupTopN={setBrowseGroupTopN}
              />
            ))}
            {(rowIndex === numRows - 1) &&
              <div 
                className="absolute overflow-hidden" 
                style={{height: chatHover ? `${numRows*100}%` : `100%`, width: "25%", right: "0", bottom: "0", opacity: 0.7, zIndex: 1e6}}
                onMouseEnter={() => setChatHover(true)}
                onMouseLeave={() => setChatHover(false)}
              >
                <Chat chatBroadcast={chatBroadcast} setTyping={setTyping}/>
              </div>
            }
          </div>

    ))
  )
})