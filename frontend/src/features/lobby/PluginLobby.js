import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import CreateRoomModal from "./CreateRoomModal";
import LobbyTable from "./LobbyTable";
import useDataApi from "../../hooks/useDataApi";
import useProfile from "../../hooks/useProfile";
import useIsLoggedIn from "../../hooks/useIsLoggedIn";
import { Announcements } from "./Announcements";
import { PluginsTable } from "./PluginsTable";
import { PatreonModal } from "../support/PatreonModal";
import { LobbyButton } from "../../components/basic/LobbyButton";
import { TermsOfServiceModal } from "./TermsOfServiceModal";
import { Footer } from "./Footer";

export const PluginLobby = () => {
  const isLoggedIn = useIsLoggedIn();
  const myUser = useProfile();
  const history = useHistory();
  const [showModal, setShowModal] = useState(null);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [replayId, setReplayId] = useState("");
  const [ringsDbInfo, setRingsDbInfo] = useState([null,null,null,null]);
  const [loadShuffle, setLoadShuffle] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState(null);

  const url = window.location.href;
  var splitUrl = url.split( '/' );
  const pluginIndex = splitUrl.findIndex((e) => e === "plugin")
  const pluginStr = splitUrl[pluginIndex + 1];
  const pluginId = parseInt(pluginStr);

  const apiPlugins = useDataApi(
    "/be/api/plugins/info/"+pluginId,
    null
  );
  console.log("Rendering Lobby", ringsDbInfo)
  useEffect(() => {
    const url = window.location.href;
    if (url.includes("newroom")) {
      if (url.includes("ringsdb") || url.includes("test")) {
        var splitUrl = url.split( '/' );
        const newroomIndex = splitUrl.findIndex((e) => e === "newroom")
        const ringsDbDomain = splitUrl[newroomIndex + 1]
        const newRingsDbInfo = [null, null, null, null];
        var deckIndex = 0;
        for (var i = newroomIndex + 2; i<splitUrl.length-1; i += 2 ) {
          const ringsDbType = splitUrl[i];
          const ringsDbId = splitUrl[i+1];
          newRingsDbInfo[deckIndex] = {id: ringsDbId, type: ringsDbType, domain: ringsDbDomain};
          deckIndex = deckIndex + 1;
        }
        setRingsDbInfo(newRingsDbInfo);
      }
      if (url.includes("replay")) {
        var splitUrl = url.split( '/' );
        const newroomIndex = splitUrl.findIndex((e) => e === "newroom")
        setReplayId(splitUrl[newroomIndex + 2]);
      }
      setShowModal("createRoom");
    }
  }, []);

  const plugin = apiPlugins?.data?.data;
  console.log("pluginslist",plugin);
  if (!plugin) return null;
  
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
        {plugin?.name} by {plugin?.author_alias}
      </div>
      <div className="flex justify-center w-full" style={{maxWidth: "600px"}}>
        <div className="w-full h-24 py-2 text-3xl">
          <LobbyButton disabled={!plugin?.tutorialUrl} onClick={() => window.open(plugin?.tutorialUrl, '_blank')}>
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
      
      <Announcements plugin={plugin}/>
      
      <div className="mb-6 w-full">
        <div className="mb-4 w-full">
          <LobbyTable plugin={plugin}/>
        </div>
      </div>

      <CreateRoomModal
        isOpen={showModal === "createRoom"}
        isLoggedIn={isLoggedIn}
        closeModal={() => setShowModal(null)}
        plugin={plugin}
      />
    </>
  );
};
export default PluginLobby;



// import React, { useEffect, useState } from "react";
// import { useHistory } from "react-router-dom";
// import CreateRoomModal from "./CreateRoomModal";
// import LobbyTable from "./LobbyTable";
// import useProfile from "../../hooks/useProfile";
// import useIsLoggedIn from "../../hooks/useIsLoggedIn";
// import { Announcements } from "./Announcements";
// import { LobbyButton } from "../../components/basic/LobbyButton";
// import useDataApi from "../../hooks/useDataApi";
// import axios from "axios";

// export const PluginLobby = () => {
//   const isLoggedIn = useIsLoggedIn();
//   const myUser = useProfile();
//   const history = useHistory();
//   const [showModal, setShowModal] = useState(null);
//   const [plugin, setPlugin] = useState(null);

//   const url = window.location.href;
//   var splitUrl = url.split( '/' );
//   const pluginIndex = splitUrl.findIndex((e) => e === "plugin")
//   const pluginStr = splitUrl[pluginIndex + 1];
//   const pluginId = parseInt(pluginStr);

//   const apiPlugins = useDataApi(
//     "/be/api/plugin/" + pluginId,
//     null
//   );

//   // useEffect(() => {
//   //   console.log("apiPlugin", apiPlugins);
//   //   if (apiPlugins) {
//   //     setPlugin(apiPlugins);
//   //   }
//   // }, [apiPlugins]);

//   const plugins = apiPlugins?.data?.data ? apiPlugins.data.data : null;
//   console.log("pluginslist 1",plugins);

//   if (!apiPlugins) return (
//     <div></div>
//   );
//   else {
//     console.log("plugin", plugin);
//   }

    
//   //   if (url.includes("newroom")) {
//   //     if (url.includes("ringsdb") || url.includes("test")) {
//   //       var splitUrl = url.split( '/' );
//   //       const newroomIndex = splitUrl.findIndex((e) => e === "newroom")
//   //       const ringsDbDomain = splitUrl[newroomIndex + 1]
//   //       const newRingsDbInfo = [null, null, null, null];
//   //       var deckIndex = 0;
//   //       for (var i = newroomIndex + 2; i<splitUrl.length-1; i += 2 ) {
//   //         const ringsDbType = splitUrl[i];
//   //         const ringsDbId = splitUrl[i+1];
//   //         newRingsDbInfo[deckIndex] = {id: ringsDbId, type: ringsDbType, domain: ringsDbDomain};
//   //         deckIndex = deckIndex + 1;
//   //       }
//   //       setRingsDbInfo(newRingsDbInfo);
//   //     }
//   //     if (url.includes("replay")) {
//   //       var splitUrl = url.split( '/' );
//   //       const newroomIndex = splitUrl.findIndex((e) => e === "newroom")
//   //       setReplayId(splitUrl[newroomIndex + 2]);
//   //     }
//   //     setShowModal("createRoom");
//   //   }
//   // }, []);

//   const handleCreateRoomClick = () => {
//     if (isLoggedIn) {
//       if (myUser?.email_confirmed_at) setShowModal("createRoom");
//       else alert("You must confirm your email before you can start a game.")
//     } else {
//       history.push("/login")
//     }
//   }

//   return (
//     <>
//       <div className="text-white text-xl">
//         {plugin.plugin_name}
//       </div>
//       <div className="flex justify-center w-full" style={{maxWidth: "600px"}}>
//         <div className="w-full h-24 py-2 text-3xl">
//           <LobbyButton disabled={!plugin?.tutorialUrl} onClick={() => window.open(plugin?.tutorialUrl, '_blank')}>
//             Tutorial
//           </LobbyButton>
//         </div>
//       </div>
      
//       <div className="flex justify-center w-full" style={{maxWidth: "600px"}}>
//         <div className="w-full h-24 py-2 text-3xl">
//           <LobbyButton onClick={() => handleCreateRoomClick()}>
//             {isLoggedIn ? "Create Room" : "Log in to create a room"}
//           </LobbyButton>
//         </div>
//       </div>
      
//       <Announcements plugin={plugin}/>
      
//       <div className="mb-6 w-full">
//         <div className="mb-4 w-full">
//           <LobbyTable plugin={plugin}/>
//         </div>
//       </div>

//       <CreateRoomModal
//         isOpen={showModal === "createRoom"}
//         isLoggedIn={isLoggedIn}
//         closeModal={() => setShowModal(null)}
//         plugin={plugin}
//       />
//     </>
//   );
// };
