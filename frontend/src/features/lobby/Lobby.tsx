import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import CreateRoomModal from "./CreateRoomModal";
import LobbyTable from "./LobbyTable";
import Button from "../../components/basic/Button";
import Container from "../../components/basic/Container";
import AdminContact from "../../components/AdminContact";
import Chat from "../chat/Chat";

import useDataApi from "../../hooks/useDataApi";
import useChannel from "../../hooks/useChannel";
import useIsLoggedIn from "../../hooks/useIsLoggedIn";

interface Props {}

export const Lobby: React.FC = () => {
  const isLoggedIn = useIsLoggedIn();
  const [showModal, setShowModal] = useState(false);
  const { isLoading, isError, data, setData } = useDataApi<any>(
    "/be/api/rooms",
    null
  );

  const onChannelMessage = useCallback(
    (event, payload) => {
      if (event === "rooms_update" && payload.rooms != null) {
        setData({ data: payload.rooms });
      }
    },
    [setData]
  );

  useChannel("lobby:lobby", onChannelMessage);
  const rooms = data != null && data.data != null ? data.data : [];

  return (
    <Container>
      <div className="flex flex-wrap">
        <div className="w-full mb-4 lg:w-3/4 xl:w-4/6">
          <div>
            <h1 className="mb-4">Lobby</h1>
            {isLoading && <div>Loading..</div>}
            {isError && <div>Error..</div>}
            <div className="mb-6">
              <h3 className="mb-2 font-semibold">New Game</h3>
              <div>
                {isLoggedIn && (
                  <Button isPrimary onClick={() => setShowModal(true)}>
                    Create Room
                  </Button>
                )}
                {!isLoggedIn && (
                  <span className="p-2 text-gray-600 bg-gray-100 border rounded">
                    <Link to="/login" className="mr-1">
                      Log In
                    </Link>
                    To Create a Room
                  </span>
                )}
              </div>
            </div>
            <div className="mb-6">
              <h3 className="mb-2 font-semibold">Current Games</h3>
              <div className="mb-4">
                <LobbyTable rooms={rooms} />
              </div>
            </div>
            <h3 className="mb-2 font-semibold">About</h3>
            <div className="max-w-none">
              <p className="mb-2">
                OneRingTeki is a{" "}
                <span className="font-semibold">
                  free online multiplayer LotR LCG game
                </span>.
              </p>
              <p className="mb-2">
                If you have any suggestions or encounter any problems, please
                email me: <AdminContact />
              </p>
              <p className="text-sm text-gray-700">
                Last Update: 2020-03-16. Version: 0.3.4.{" "}
                <a
                  href="https://github.com/seastan/spades/blob/master/CHANGELOG.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Changelog
                </a>
                .
              </p>
            </div>
            <CreateRoomModal
              isOpen={showModal}
              closeModal={() => setShowModal(false)}
            />
          </div>
        </div>
        <div className="w-full mb-4 lg:w-1/4 xl:w-2/6">
          <div className="flex items-end h-full">
            <Chat roomName="lobby" />
          </div>
        </div>
      </div>
    </Container>
  );
};
export default Lobby;
