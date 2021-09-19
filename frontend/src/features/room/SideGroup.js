import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { Stacks } from "./Stacks";
import { GROUPSINFO, CARDSCALE, LAYOUTINFO } from "./Constants";
import useWindowDimensions from "../../hooks/useWindowDimensions";

export const SideGroup = React.memo(({
  gameBroadcast,
  chatBroadcast,
  playerN,
  browseGroupId,
  registerDivToArrowsContext,
  cardSizeFactor,
  sideGroupId,
}) => {
  console.log("Rendering TableLayout");
  const numPlayersStore = state => state.gameUi.game.numPlayers;
  const numPlayers = useSelector(numPlayersStore);
  const layoutStore = state => state.gameUi?.game?.layout;
  const layout = useSelector(layoutStore);
  const { height, width } = useWindowDimensions();
  const aspectRatio = width/height;

  const layoutInfo = LAYOUTINFO["layout" + numPlayers + layout];
  const numRows = layoutInfo.length;
  var cardSize = CARDSCALE/numRows;
  if (aspectRatio < 1.9) cardSize = cardSize*(1-0.75*(1.9-aspectRatio));

  cardSize = cardSize*cardSizeFactor/100;

  var middleRowsWidth = 100;
  if (sideGroupId !== "") {
    if (numRows >= 6) middleRowsWidth = 93;
    else middleRowsWidth = 91;
  }

  return (
      Object.keys(GROUPSINFO).includes(sideGroupId) && browseGroupId !== sideGroupId &&
        <div className="relative float-left" style={{height: `${100-2*(100/numRows)}%`, width:`${100-middleRowsWidth}%`}}>
          <div className="absolute text-center w-full select-none text-gray-500">
              <div className="mt-1">
                {GROUPSINFO[sideGroupId].tablename}
            </div>
          </div>
          <div className="w-full h-full mt-4">
            <Stacks
              gameBroadcast={gameBroadcast}
              chatBroadcast={chatBroadcast}
              playerN={playerN}
              groupId={sideGroupId}
              groupType={"vertical"}
              cardSize={cardSize}
              registerDivToArrowsContext={registerDivToArrowsContext}
            />
          </div>
        </div>
      
  )
})
