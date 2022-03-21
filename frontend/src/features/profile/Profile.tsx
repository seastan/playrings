import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import MUIDataTable, { MUIDataTableOptions } from "mui-datatables";
import Container from "../../components/basic/Container";
import ProfileSettings from "./ProfileSettings";
import useProfile from "../../hooks/useProfile";
import useDataApi from "../../hooks/useDataApi";
import Button from "../../components/basic/Button";
import ShareGameModal from "./ShareGameModal";
import { parseISO, format, formatDistanceToNow } from "date-fns";
import axios from "axios";

const columns = [
  {name: "uuid", label: "UUID", options: { filter: false, display: false }},
  {name: "encounter", label: "Encounter", options: { filter: false, sort: true }},
  {name: "rounds", label: "Rounds", options: { filter: false, sort: false }},
  {name: "outcome", label: "Outcome", options: { filter: true, sort: false }},
  {name: "num_players", label: "Players", options: { filter: true, sort: false }},
  {name: "player1_heroes", label: "Player 1", options: { filter: false, sort: false }},
  {name: "player2_heroes", label: "Player 2", options: { filter: false, sort: false }},
  {name: "player3_heroes", label: "Player 3", options: { filter: false, sort: false }},
  {name: "player4_heroes", label: "Player 4", options: { filter: false, sort: false }},
  {name: "updated_at", label: "Date", options: { filter: false, sort: true }},
  {name: "options", label: "Options", options: { filter: false, sort: true }},
 ]; //, sortDirection: "asc" as const

interface Props {}

export const Profile: React.FC<Props> = () => {
  const user = useProfile();
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  const [shareReplayId, setShareReplayId] = useState("");
  const [deletedIndices, setDeletedIndices] = useState<Array<number>>([]); 
  var [wins, losses, incompletes] = [0, 0, 0];
  console.log('Rendering Profile');
  const { data, isLoading, isError, doFetchUrl, doFetchHash, setData } = useDataApi<any>(
    "/be/api/replays/"+user?.id,
    null
  );
  useEffect(() => {
    doFetchUrl("/be/api/replays/"+user?.id);
  }, [user]);
  if (user == null) {
    return null;
  }
  const insertedDate = parseISO(user.inserted_at);
  const insertedAbsolute = format(insertedDate, "yyyy-MM-dd hh:mm bb");
  const insertedRelative = formatDistanceToNow(insertedDate, {
    addSuffix: true,
  });
  const openReplay = (uuid: any) => {
    history.push("/newroom/replay/"+uuid);
  }
  const shareReplay = (uuid: any) => {
    setShareReplayId(uuid);
    setShowModal(true);
  }
  const deleteReplay = async(replay: any, index: number, numPlayers: number) => {
    if (window.confirm("Are you sure you want to delete this replay?")) {
      const data = {
        user: user,
        replay: replay,
      }
      const res = await axios.post("/be/api/replays/delete",data);
      setDeletedIndices([...deletedIndices, index]);
    }
  }      

  const options: MUIDataTableOptions = {
    filterType: "checkbox",
    selectableRows: "none",
    //onRowClick: rowData => openReplay(rowData)
  };
  var filteredData;
  if (data) {
    var replayData = data.data;
    var nonDeletedData: Array<any> = [];
    for (var i=0; i<replayData.length; i++) {
    //for (var replay of replayData) {
      const replay = replayData[i];
      if (replay.deleted_by && replay.deleted_by.includes(user.id)) continue;
      const numPlayers = replay.num_players;
      const uuid = replay.uuid;
      const replayId = replay.id;
      const index = i;
      const replayRow = {...replay, 
        options: <div>
          <Button onClick={() => openReplay(uuid)} isPrimary className="mx-2 mt-2">Load</Button>
          <Button onClick={() => shareReplay(uuid)} isPrimary className="mx-2 mt-2">Share</Button>
          <Button onClick={() => deleteReplay(replay, index, numPlayers)} className="mx-2 mt-2">Delete</Button>
        </div>
      }
      if (replay.outcome === "victory") wins++;
      else if (replay.outcome === "defeat") losses++;
      else incompletes++;
      if (!deletedIndices.includes(i)) nonDeletedData.push(replayRow);
    }
    if (user.supporter_level < 3) 
      filteredData = nonDeletedData.slice(0,3);
    else
      filteredData = nonDeletedData;
  }
  const winRate = wins + losses === 0 ? 0 : Math.round(wins/(wins+losses)*100)
  return (
    <div className="w-full h-full overflow-y-scroll">
      <Container>
        <div className="bg-gray-100 p-4 rounded max-w-xl shadow">
          <h1 className="font-semibold mb-4 text-black">{user.alias}</h1>
          <div>
            <span className="font-semibold">Account created</span>:{" "}
            {insertedAbsolute} ({insertedRelative})
          </div>
          <div>
            <span className="font-semibold">Email</span>: {user.email}
          </div>
          <div>
            <span className="font-semibold">Email confirmed</span>:{" "}
            {user.email_confirmed_at == null && "No."}
            {user.email_confirmed_at != null && "Yes."}
          </div>
          <div>
            <span className="font-semibold">Patreon supporter level</span>: {user.supporter_level ? user.supporter_level : 0}
          </div>
          {user.playtester && 
            <div>
              <span className="font-semibold">Playtester</span>
            </div>
          }
        </div>
      </Container>

      <ProfileSettings/>
      <Container>
        <div className="bg-gray-100 p-4 rounded max-w-xl shadow">
          <h1 className="font-semibold mb-2 text-black">Saved game settings</h1>
          Currently displaying {user.supporter_level < 3 ? "your 3 most recent games." : "all your saved games."} 
          {user.supporter_level < 3 &&             
            <Button isSubmit isPrimary className="mx-2 mt-2">
              <img className="inline-block mr-2" style={{height: "20px", width: "20px"}} src="https://upload.wikimedia.org/wikipedia/commons/9/94/Patreon_logo.svg"/>
              <a className="text-white no-underline" href="https://www.patreon.com/dragncards">Unlock all saved games</a>
            </Button>
          }
          <h1 className="font-semibold mb-2 mt-4 text-black">Stats</h1>
          <table>
            <tr>Wins: {wins}</tr>
            <tr>Losses: {losses}</tr>
            <tr>Incomplete: {incompletes}</tr>
            <tr>Win rate: {winRate}%</tr>
          </table>
        </div>
      </Container>
      
      {filteredData ?
        <div className="p-4 bg-gray-900">
        <MUIDataTable
          title={"Saved games"}
          data={filteredData}
          columns={columns}
          options={options}
        />
        </div>
        :
        <Container>
          <div className="bg-gray-100 p-4 rounded max-w-xl shadow">
            <h1 className="font-semibold mb-4 text-black">Loading saved games...</h1>
          </div>
        </Container>
      }

      <ShareGameModal
        isOpen={showModal}
        closeModal={() => setShowModal(false)}
        shareReplayId={shareReplayId}
      />
    </div>
  );
};
export default Profile;
