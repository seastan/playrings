import React from "react";
import { TopBarMenu } from "./TopBarMenu";
import { TopBarView } from "./TopBarView";
import { TopBarDataContainer } from "./TopBarDataContainer";

export const TopBar = React.memo(({
  setShowModal,
  setShowHotkeys,
  setShowPlayersInRoom,
  handleBrowseSelect,
  gameBroadcast,
  chatBroadcast,
  playerN,
  setTyping,
  setLoaded,
}) => {
  console.log("Rendering TopBar");
  return(
    <div className="h-full">
      <ul className="top-level-menu float-left">
        <TopBarMenu
          setShowModal={setShowModal}
          gameBroadcast={gameBroadcast}
          chatBroadcast={chatBroadcast}
          playerN={playerN}
          setLoaded={setLoaded}
        />
        <TopBarView
          setShowHotkeys={setShowHotkeys}
          setShowPlayersInRoom={setShowPlayersInRoom}
          handleBrowseSelect={handleBrowseSelect}
          playerN={playerN}
        />
      </ul>
      <TopBarDataContainer
        playerN={playerN}
        gameBroadcast={gameBroadcast}
        chatBroadcast={chatBroadcast}
        setTyping={setTyping}
      />
    </div>
  )
})