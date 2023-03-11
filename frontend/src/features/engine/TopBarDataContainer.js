import React from "react";
import { TopBarUser } from "./TopBarUser";
import { TopBarShared } from "./TopBarShared";
import { usePlayerIList } from "./functions/usePlayerIList";

export const TopBarDataContainer = React.memo(({}) => {

  const playerIList = usePlayerIList();
    console.log("Rendering TopBarDataContainer", playerIList)
    
    return(
      <div className="h-full">
        <TopBarShared/>
        {playerIList.map((playerI, playerIndex) => (
          <TopBarUser key={playerIndex} playerI={playerI}/>
        ))}
      </div>
    )
})