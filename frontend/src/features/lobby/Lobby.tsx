import React, { useState, useCallback, useEffect } from "react";
import { ChatMessage } from "elixir-backend";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import CreateRoomModal from "./CreateRoomModal";
import LobbyTable from "./LobbyTable";
import Button from "../../components/basic/Button";
import Container from "../../components/basic/Container";
import AdminContact from "../../components/AdminContact";
import Chat from "../chat/Chat";
import useDataApi from "../../hooks/useDataApi";
import useChannel from "../../hooks/useChannel";
import useProfile from "../../hooks/useProfile";
import useIsLoggedIn from "../../hooks/useIsLoggedIn";

interface Props {}

const isNormalInteger = (str: string) => {
  var n = Math.floor(Number(str));
  return n !== Infinity && String(n) === str && n >= 0;
}

const filterArrayForPositiveInt = (arr: Array<string>) => {
  const newArr = [];
  for (var s of arr) {
    if (isNormalInteger(s)) {
      newArr.push(s);
    }
  }
  return newArr;
}

export const Lobby: React.FC = () => {
  const isLoggedIn = useIsLoggedIn();
  const myUser = useProfile();
  const myUserId = myUser?.id;
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  const [replayId, setReplayId] = useState("");
  const [ringsDbInfo, setRingsDbInfo] = useState<Array<any>>([null,null,null,null]);
  const [loadShuffle, setLoadShuffle] = useState(false);
  const { isLoading, isError, data, setData } = useDataApi<any>(
    "/be/api/rooms",
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
        const newRingsDbInfo: Array<any> = [null, null, null, null];
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
      setShowModal(true);
    }
  }, []);

  const onChannelMessage = useCallback(
    (event, payload) => {
      if (event === "rooms_update" && payload.rooms != null) {
        setData({ data: payload.rooms });
      }
    },
    [setData]
  );

  useChannel("lobby:lobby", onChannelMessage, myUserId);
  const rooms = data != null && data.data != null ? data.data : [];

  const handleCreateRoomClick = () => {
    if (isLoggedIn) {
      if (myUser?.email_confirmed_at) setShowModal(true);
      else alert("You must confirm your email before you can start a game.")
    } else {
      history.push("/login")
    }
  }

  const lobbyButtonClass = "border cursor-pointer hover:bg-white hover:text-black h-full w-full flex items-center justify-center text-white no-underline select-none"

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
      }}
        >
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
                <a className={lobbyButtonClass} target="_blank" href="https://patreon.com/DragnCards">
                  Patreon
                </a>
              </div>
              <div className="w-full h-1/3 p-2">
                <a className={lobbyButtonClass} target="_blank" href="https://discord.gg/7BQv5ethUm">
                  Discord
                </a>
              </div>
              <div className="w-full h-1/3 p-2">
                <a className={lobbyButtonClass} target="_blank" href="https://github.com/seastan/DragnCards">
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full p-2" style={{maxWidth: "600px"}}>
          {isLoading && <div className="text-white text-center">Connecting to server...</div>}
          {isError && <div className="text-white text-center">Error communicating with server...</div>}
          <div className="flex justify-center w-full" style={{maxWidth: "600px"}}>
            <div className="w-full h-24 py-2 text-3xl">
              <a className={lobbyButtonClass} target="_blank" href="https://www.youtube.com/watch?v=mshb1EDsnB8&list=PLuyP-hlzlHjd-XADfU-kqJaGpSE9RWHRa&index=1">
                Tutorial
              </a>
            </div>
          </div>
          {(!isLoading && !isError) &&
            <div className="flex justify-center w-full" style={{maxWidth: "600px"}}>
              <div className="w-full h-24 py-2 text-3xl">
                <div className={lobbyButtonClass} onClick={() => handleCreateRoomClick()}>
                  {isLoggedIn ? "Create Room" : "Log in to create a room"}
                </div>
              </div>
            </div>
          }
          {(!isLoading && !isError) &&
            <div className="mb-6 w-full">
              <div className="mb-4 w-full">
                <LobbyTable rooms={rooms} />
              </div>
            </div>
          }
          <h3 className="mt-6 font-semibold text-center">About</h3>
          <div className="max-w-none">
            <p className="mb-2">
              DragnCards is a{" "}
              <span className="font-semibold">
                free online multiplayer card game platform
              </span>, and is not affiliated with or endorsed by FFG or any other company.
            </p>
          </div>
          <CreateRoomModal
            isOpen={showModal}
            isLoggedIn={isLoggedIn}
            closeModal={() => setShowModal(false)}
            replayId={replayId}
            ringsDbInfo={ringsDbInfo}
            loadShuffle={loadShuffle}
          />
        </div>
        {/* <div className="w-full mb-4 lg:w-1/4 xl:w-2/6">
          <div className="flex items-end h-full">
            <Chat chatBroadcast={chatBroadcast} messages={messages} setTyping={setTyping} />
          </div>
        </div> */}
      </div>
  );
};
export default Lobby;
