import React from "react";
import UserName from "../user/UserName";
import useProfile from "../../hooks/useProfile";
import { Link } from "react-router-dom";
import MUIDataTable, { MUIDataTableOptions } from "mui-datatables";



export const PluginsTable = ({ plugins }) => {
  console.log("plugins 1", plugins)
  const columns = [
    {name: "plugin_name", label: "Plugin", options: { filter: false, sort: true }},
    {name: "author_alias", label: "Author", options: { filter: false, sort: true }},
    //{name: "looking_for_players", label: "Looking for players", options: { filter: true, sort: true }},
    {name: "num_favorites", label: "Favorites", options: { filter: true, sort: true }},
    {name: "options", label: "Options", options: { filter: false, sort: true }},
  ];
  const options = {
    filterType: "checkbox",
    selectableRows: "none",
    download: false,
    print: false,
    sortOrder: {
      name: 'num_favorites',
      direction: 'asc',
    },
    rowsPerPage: 20,
    rowsPerPageOptions: [10, 20, 50, 200],
  }
  console.log("plugins 2", plugins)
  const toggleFavorite = () => null;
  for (var plugin of plugins) {
    plugin["options"] =  <div>
      <div onClick={() => toggleFavorite(plugin.plugin_uuid)} isPrimary className="mx-2 mt-2">Star</div>
    </div>
  }
  
  return (
    <>
      <MUIDataTable
        title={"Plugins"}
        data={plugins}
        columns={columns}
        options={options}
      />
    </>
  );
};
export default PluginsTable;
