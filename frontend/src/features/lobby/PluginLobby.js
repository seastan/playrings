import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import CreateRoomModal from "./CreateRoomModal";
import LobbyTable from "./LobbyTable";
import useProfile from "../../hooks/useProfile";
import useIsLoggedIn from "../../hooks/useIsLoggedIn";
import { Announcements } from "./Announcements";
import { LobbyButton } from "../../components/basic/LobbyButton";

export const PluginLobby = ({selectedPlugin}) => {
  const isLoggedIn = useIsLoggedIn();
  const myUser = useProfile();
  const history = useHistory();
  const [showModal, setShowModal] = useState(null);

  const handleCreateRoomClick = () => {
    if (isLoggedIn) {
      if (myUser?.email_confirmed_at) setShowModal("createRoom");
      else alert("You must confirm your email before you can start a game.")
    } else {
      history.push("/login")
    }
  }

  return (
    <>
      <div className="text-white text-xl">
        {selectedPlugin.plugin_name}
      </div>
      <div className="flex justify-center w-full" style={{maxWidth: "600px"}}>
        <div className="w-full h-24 py-2 text-3xl">
          <LobbyButton disabled={!selectedPlugin?.tutorialUrl} onClick={() => window.open(selectedPlugin?.tutorialUrl, '_blank')}>
            Tutorial
          </LobbyButton>
        </div>
      </div>
      
      <div className="flex justify-center w-full" style={{maxWidth: "600px"}}>
        <div className="w-full h-24 py-2 text-3xl">
          <LobbyButton onClick={() => handleCreateRoomClick()}>
            {isLoggedIn ? "Create Room" : "Log in to create a room"}
          </LobbyButton>
        </div>
      </div>
      
      <Announcements selectedPlugin={selectedPlugin}/>
      
      <div className="mb-6 w-full">
        <div className="mb-4 w-full">
          <LobbyTable selectedPlugin={selectedPlugin}/>
        </div>
      </div>

      <CreateRoomModal
        isOpen={showModal === "createRoom"}
        isLoggedIn={isLoggedIn}
        closeModal={() => setShowModal(null)}
        plugin={selectedPlugin}
      />
    </>
  );
};
