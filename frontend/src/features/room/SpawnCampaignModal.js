import React, {useState} from "react";
import ReactModal from "react-modal";
import { buildLoadList, processLoadList, processPostLoad } from "./Helpers";
import { DropdownItem } from "./DropdownMenuHelpers";
import { setShowModal } from "../store/playerUiSlice";
import { useDispatch, useSelector } from "react-redux";

function requireAll( requireContext ) {
  return requireContext.keys().map( requireContext );
}
const packs = requireAll( require.context("../../../../frontend/public/load/campaign/", true, /.txt$/) );

const getNameFromPackPath = (packPath) => {
  var name = packPath.split("/").pop();
  name = name.split('.').reverse()[2];
  name = name.slice(2);
  return name.replace(/_/ig, " ");
}

export const SpawnCampaignModal = React.memo(({
    gameBroadcast,
    chatBroadcast,
}) => { 
    const dispatch = useDispatch();
    const playerN = useSelector(state => state?.playerUi?.playerN);

    const [menuHeight, setMenuHeight] = useState(null);

    const handleDropdownClick = async(props) => {
      const res = await fetch(props.packPath);
      const text = await res.text();
      var reducedLoadList = JSON.parse(text);
      var loadList = buildLoadList(reducedLoadList);
      loadList = processLoadList(loadList, playerN);
      gameBroadcast("game_action", {action: "load_cards", options: {load_list: loadList}});
      chatBroadcast("game_update",{message: "loaded campaign cards."});
      processPostLoad(null, loadList, playerN, gameBroadcast, chatBroadcast);
      dispatch(setShowModal(null));
    }

    return(
      <ReactModal
        closeTimeoutMS={200}
        isOpen={true}
        onRequestClose={() => setShowModal(null)}
        contentLabel="Load quest"
        overlayClassName="fixed inset-0 bg-black-50 z-10000"
        className="insert-auto p-5 bg-gray-700 border max-w-lg max-h-lg mx-auto my-2 rounded-lg outline-none"
        style={{
          content: {
            maxHeight: "95vh",
            overflowY: "scroll",
          }
        }}
      >
        <h1 className="mb-2">Load Campaign Cards</h1>
        <div 
          className="modalmenu bg-gray-800" 
          style={{ height: menuHeight}}
        >
        {/* Difficulty menu */}
        {packs.map((packPath, _) => {
          return(
            <div className="menu">
              <DropdownItem
                packPath={packPath}
                clickCallback={handleDropdownClick}>
                {getNameFromPackPath(packPath)}
              </DropdownItem>
            </div>
          )
        })}
        </div>
      </ReactModal>
    )
})