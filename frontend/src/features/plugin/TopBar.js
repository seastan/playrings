import React from "react";
import { TopBarMenu } from "./TopBarMenu";
import { TopBarView } from "./TopBarView";
import { TopBarDataContainer } from "./TopBarDataContainer";

export const TopBar = React.memo(({
  gameBroadcast,
  chatBroadcast,
}) => {
  console.log("Rendering TopBar");
  return(
    <div className="h-full">
      <ul className="top-level-menu float-left">
        <TopBarMenu
          gameBroadcast={gameBroadcast}
          chatBroadcast={chatBroadcast}
        />
        <TopBarView/>
      </ul>
      <TopBarDataContainer
        gameBroadcast={gameBroadcast}
        chatBroadcast={chatBroadcast}
      />
    </div>
  )
})