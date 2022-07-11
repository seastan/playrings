import React from "react";
import { TopBarUser } from "./TopBarUser";
import { TopBarShared } from "./TopBarShared";
import { usePlayerIList } from "./functions/usePlayerIList";

export const TopBarDataContainer = React.memo(({}) => {
  
    const playerIList = usePlayerIList();
    
    return(
      <div className="h-full">
        <TopBarShared/>
        {playerIList.map((playerI, _playerIndex) => (
          <TopBarUser playerI={playerI}/>
        ))}
      </div>
    )
})