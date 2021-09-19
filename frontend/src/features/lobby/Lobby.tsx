import React, { useState, useCallback, useEffect } from "react";
import { ChatMessage } from "elixir-backend";
import { Link } from "react-router-dom";
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
    if (myUser?.email_confirmed_at) setShowModal(true);
    else alert("You must confirm your email before you can start a game.")
  }

  return (
      <div className="w-full bg-gray-900" style={{fontFamily:"Roboto"}}>
        {0 ? 
        <div className="mt-4 mx-auto" style={{width: "600px"}}>
          <div className="mb-6">
            {/* <h3 className="mb-2 font-semibold text-center">New Game</h3> */}
            <div className="flex justify-center" style={{width: "600px"}}>
              <span className="p-2 text-white bg-gray-700 rounded">
                Down for maintenance.
              </span>
            </div>
          </div>
        </div>
        :
        <div className="mt-4 mx-auto" style={{width: "600px"}}>
          <div className="mb-6">
            {/* <h3 className="mb-2 font-semibold text-center">New Game</h3> */}
            <div className="flex justify-center" style={{width: "600px"}}>
              <span className="p-2 text-white bg-gray-700 rounded">
                New to DragnCards?  
                <a href="https://tinyurl.com/DragnCardsYoutube" className="ml-1 text-white">
                  Watch the tutorial
                </a>
              </span>
            </div>
          </div>
          <div className="mb-6">
            {/* <h3 className="mb-2 font-semibold text-center">New Game</h3> */}
            <div className="flex justify-center" style={{width: "600px"}}>
              <span className="p-2 text-white bg-gray-700 rounded">
                Bug reports? Feature requests? Post them on   
                <a href="https://discord.gg/7BQv5ethUm" className="ml-1 mr-1 text-white">
                  Discord
                </a> 
                or
                <a href="https://github.com/seastan/DragnCards" className="ml-1 text-white">
                  GitHub
                </a>
              </span>
            </div>
          </div>
          <h1 className="mb-4 text-center">Lobby</h1>
          {isLoading && <div className="text-white text-center">Connecting to server...</div>}
          {isError && <div className="text-white text-center">Error communicating with server...</div>}
          {(!isLoading && !isError) &&
            <div className="mb-6">
              {/* <h3 className="mb-2 font-semibold text-center">New Game</h3> */}
              <div className="flex justify-center" style={{width: "600px"}}>
                <div style={{width: "200px"}}>
                {isLoggedIn && (
                  <Button isPrimary onClick={() => handleCreateRoomClick()}>
                    Create Room
                  </Button>
                )}
                {!isLoggedIn && (
                  <span className="p-2 text-white bg-gray-700 rounded">
                    <Link to="/login" className="mr-1 text-white">
                      Log In
                    </Link>
                    to create a room
                  </span>
                )}
                </div>
              </div>
            </div>
          }
          {(!isLoading && !isError) &&
            <div className="mb-6 w-full">
              <h3 className="mb-2 font-semibold text-center">Current Games</h3>
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
        </div>}
        {/* <div className="w-full mb-4 lg:w-1/4 xl:w-2/6">
          <div className="flex items-end h-full">
            <Chat chatBroadcast={chatBroadcast} messages={messages} setTyping={setTyping} />
          </div>
        </div> */}
      </div>
  );
};
export default Lobby;
