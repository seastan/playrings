import React from "react";
import UserName from "../user/UserName";
import useProfile from "../../hooks/useProfile";
import { Link } from "react-router-dom";
import { Room } from "elixir-backend";
import MUIDataTable, { MUIDataTableOptions } from "mui-datatables";

interface Props {
  rooms: Array<Room>;
}

const columns = [
  {name: "name", label: "Name", options: { filter: false, display: false }},
  {name: "quest", label: "Name", options: { filter: false, sort: true }},
  {name: "host", label: "Host", options: { filter: false, sort: true }},
  //{name: "looking_for_players", label: "Looking for players", options: { filter: true, sort: true }},
  {name: "mode", label: "Mode", options: { filter: true, sort: true }},
  {name: "status", label: "Status", options: { filter: true, sort: true }},
 ];

export const LobbyTable: React.FC<Props> = ({ rooms }) => {
  const myUser = useProfile();
  const currentUnixTime = Math.floor(Date.now() / 1000);
  const options: MUIDataTableOptions = {
    filterType: "checkbox",
    selectableRows: "none",
    download: false,
    print: false,
    sortOrder: {
      name: 'status',
      direction: 'asc',
    },
    rowsPerPage: 20,
    rowsPerPageOptions: [10, 20, 50, 200],
  }
  var filteredRooms: any[] = [];
  var activePrivate = 0;
  var activeRooms = 0;
  if (rooms) {
    for (var i=0; i<rooms.length; i++) {
    //for (var replay of replayData) {
      var room = rooms[i];
      const elapsedSeconds = (room.last_update ? currentUnixTime - room.last_update : Number.MAX_SAFE_INTEGER);
      const status = (elapsedSeconds < 60 ? "Active" : "Idle");
      if (status === "Active") activeRooms++;
      if (status === "Active" && room.privacy_type !== "public") activePrivate++;
      // Currently there is no "admin" user field so I am usering supporter_level === 100 as a hack
      if (room.privacy_type === "public" || (room.privacy_type === "playtest" && myUser?.playtester) || myUser?.id === room.created_by || myUser?.supporter_level === 100) {

        filteredRooms.push({
          name: room.name,
          quest: <Link to={"/room/" + room.slug}>{room.name || "Unspecified"}</Link>,
          host: <UserName userID={room.created_by} defaultName="Unspecified"></UserName>,
          //looking_for_players: "No",
          mode: room.privacy_type,
          status: status,
        })
      }
    }
  }

  const compare = ( a : any, b : any ) => {
    if ( a.name < b.name ){
      return -1;
    }
    if ( a.name > b.name ){
      return 1;
    }
    return 0;
  }
  
  filteredRooms.sort( compare );

  if (filteredRooms.length === 0) {
    return (
      <div className="p-3 text-white rounded bg-gray-700 w-full">
        No rooms created.
      </div>
    );
  }
  return (
    <>
      <div className="w-full text-white text-center">Active rooms: {activeRooms}</div>
      <MUIDataTable
        title={"Rooms"}
        data={filteredRooms}
        columns={columns}
        options={options}
      />
    </>
  );
};
export default LobbyTable;
