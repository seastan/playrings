import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import MUIDataTable, { MUIDataTableOptions } from "mui-datatables";
import Container from "../../components/basic/Container";
import useProfile from "../../hooks/useProfile";
import useDataApi from "../../hooks/useDataApi";
import Button from "../../components/basic/Button";
import { parseISO, format, formatDistanceToNow } from "date-fns";
import axios from "axios";
import { EditPluginModal } from "./EditPluginModal";

const columns = [
  {name: "plugin_id", label: "ID", options: { filter: false, display: false }},
  {name: "plugin_name", label: "Name", options: { filter: false, sort: true }},
  {name: "version", label: "Version", options: { filter: false, sort: false }},
  {name: "subscribers", label: "Favorites", options: { filter: true, sort: false }},
 ]; //, sortDirection: "asc" as const


export const MyPlugins = () => {
  const user = useProfile();
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  const [pluginId, setPluginId] = useState(null);
  const [deletedIndices, setDeletedIndices] = useState([]); 
  var [wins, losses, incompletes] = [0, 0, 0];
  console.log('Rendering MyPlugins');
  const { data, isLoading, isError, doFetchUrl, doFetchHash, setData } = useDataApi(
    "/be/api/myplugins/"+user?.id,
    null
  );
  useEffect(() => {
    doFetchUrl("/be/api/myplugins/"+user?.id);
  }, [user]);
  if (user == null) {
    return null;
  }
  const insertedDate = parseISO(user.inserted_at);
  const insertedAbsolute = format(insertedDate, "yyyy-MM-dd hh:mm bb");
  const insertedRelative = formatDistanceToNow(insertedDate, {
    addSuffix: true,
  });
  const handleNewClick = () => {
    setPluginId(null);
    setShowModal(true);
  }

  const lobbyButtonClass = "border cursor-pointer hover:bg-white hover:text-black h-full w-full flex items-center justify-center text-white no-underline select-none"

  return (
    <div className="mt-4 mx-auto w-full p-2" style={{maxWidth: "600px"}}>
      <div className="w-full h-1/3 p-2">
        <a className={lobbyButtonClass} target="_blank" onClick={() => handleNewClick()}>
          New Plugin
        </a>
      </div>
      <EditPluginModal
        isOpen={showModal}
        closeModal={() => setShowModal(false)}
        pluginId={pluginId}
      />
    </div>
  );
};
export default MyPlugins;
