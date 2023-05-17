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

export const Lobby = () => {
  const isLoggedIn = useIsLoggedIn();
  const myUser = useProfile();
  const myUserId = myUser?.id;
  const history = useHistory();
  const [showModal, setShowModal] = useState(null);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [replayId, setReplayId] = useState("");
  const [ringsDbInfo, setRingsDbInfo] = useState([null,null,null,null]);
  const [loadShuffle, setLoadShuffle] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const apiPlugins = useDataApi(
    "/be/api/plugins",
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
        setReplayId(splitUrl[newroomIndex + 2])
        if (splitUrl[newroomIndex + 3] && splitUrl[newroomIndex + 3] === "shuffle") setLoadShuffle(true);
        else setLoadShuffle(false);
      }
      setShowModal("createRoom");
    }
  }, []);

  const plugins = apiPlugins?.data?.data ? apiPlugins.data.data : [];
  console.log("pluginslist",plugins);

  const handleCreateRoomClick = () => {
    if (isLoggedIn) {
      if (myUser?.email_confirmed_at) setShowModal("createRoom");
      else alert("You must confirm your email before you can start a game.")
    } else {
      history.push("/login")
    }
  }

  return (
      <div 
        className="w-full overflow-y-scroll overflow-x-hidden" 
        style={{fontFamily:"Roboto", height: "97vh", 
        background: `url(${process.env.PUBLIC_URL + '/images/other/background.jpg'}) no-repeat center center fixed`,
        backgroundSize: 'cover',
        WebkitBackgroundSize: 'cover',
        MozBackgroundSize: 'cover',
        OBackgroundSize: 'cover',
        backgroundColor: `rgba(50,50,50,0.95)`,
        backgroundBlendMode: 'overlay'
      }}>
        <div className="mt-4 mx-auto w-full p-2" style={{maxWidth: "600px"}}>
          <div style={{height: "200px"}}>
            <div className="w-1/2 h-full float-left">
              <div className="w-full h-full flex items-center justify-center">
                <img 
                  className="" 
                  style={{height: "200px"}} 
                  src={process.env.PUBLIC_URL + '/logosvg.svg'}/>
              </div>
            </div>
            <div className="w-1/2 h-full float-right">
              <div className="w-full h-1/3 p-2">
                <LobbyButton onClick={() => setShowModal("patreon")}>
                  Patreon
                </LobbyButton>
              </div>
              <div className="w-full h-1/3 p-2">
                <LobbyButton onClick={() => window.open('https://discord.gg/7BQv5ethUm', '_blank')}>
                  Discord
                </LobbyButton>
              </div>
              <div className="w-full h-1/3 p-2">
                <LobbyButton onClick={() => window.open('https://github.com/seastan/DragnCards', '_blank')}>
                  GitHub
                </LobbyButton>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full p-2" style={{maxWidth: "600px"}}>
          {selectedPlugin ?
            <>
              <div className="text-white text-xl">
                {selectedPlugin.plugin_name}
              </div>
              <div className="flex justify-center w-full" style={{maxWidth: "600px"}}>
                <div className="w-full h-24 py-2 text-3xl">
                  <LobbyButton onClick={() => window.open("https://www.youtube.com/watch?v=mshb1EDsnB8&list=PLuyP-hlzlHjd-XADfU-kqJaGpSE9RWHRa&index=1", '_blank')}>
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
              
              <Announcements/>
              
              <div className="mb-6 w-full">
                <div className="mb-4 w-full">
                  <LobbyTable selectedPlugin={selectedPlugin} />
                </div>
              </div>
              <CreateRoomModal
                isOpen={showModal === "createRoom"}
                isLoggedIn={isLoggedIn}
                closeModal={() => setShowModal(null)}
                plugin={selectedPlugin}
              />
            </>
            :
            <div className="w-full" style={{minHeight: "600px"}}>
              <div className="text-center text-white text-2xl mb-2">Public Plugins</div>
              <PluginsTable plugins={plugins} setSelectedPlugin={setSelectedPlugin} />

            </div>
            
          }
        </div>

        <div className="mx-auto w-full p-2" style={{maxWidth: "600px"}}>
          <h3 className="mt-6 font-semibold text-center text-gray-300">About</h3>
          <div className="max-w-none">
            <p className="mb-2 text-xs text-gray-300">
              DragnCards is a free and independent online multiplayer card game platform. 
              We don't claim intellectual property rights over any content on this site. 
              Game-related assets visible on DragnCards are not hosted on our platform, 
              but rather are linked to by plugin developers, who are are responsible for 
              ensuring their plugin doesn't infringe upon third-party rights. DragnCards 
              is not endorsed by or affiliated with any game publishers or developers. 
              Please refer to our{" "}
              <span className="underline cursor-pointer" onClick={() => setShowTermsOfService(true)}>
                Terms of Service and Privacy Policy
              </span> for more info.
            </p>
          </div>
        </div>

        <TermsOfServiceModal
          isOpen={showTermsOfService}
          closeModal={() => setShowTermsOfService(false)}
        />
        
        <PatreonModal
          isOpen={showModal === "patreon"}
          isLoggedIn={isLoggedIn}
          closeModal={() => setShowModal(null)}
        />

        {/* <div className="w-full mb-4 lg:w-1/4 xl:w-2/6">
          <div className="flex items-end h-full">
            <Chat chatBroadcast={chatBroadcast} messages={messages} setTyping={setTyping} />
          </div>
        </div> */}
      </div>
  );
};
export default Lobby;
