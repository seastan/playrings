import React, {useState} from "react";
import { useSelector } from 'react-redux';
import ReactModal from "react-modal";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { loadDeckFromXmlText, processLoadList, processPostLoad } from "./Helpers";
import { CYCLEORDER, CYCLEINFO } from "./Constants";
import { calcHeightCommon, DropdownItem, GoBack } from "./DropdownMenuHelpers";
import useProfile from "../../hooks/useProfile";

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
    playerN,
    setTyping,
    setShowModal,
    gameBroadcast,
    chatBroadcast,
}) => { 
    const [menuHeight, setMenuHeight] = useState(null);

    const handleDropdownClick = async(props) => {
      const res = await fetch(props.packPath);
      const text = await res.text();
      var loadList = JSON.parse(text);
      loadList = processLoadList(loadList, playerN);
      gameBroadcast("game_action", {action: "load_cards", options: {load_list: loadList}});
      chatBroadcast("game_update",{message: "loaded campaign cards."});
      processPostLoad(null, loadList, playerN, gameBroadcast, chatBroadcast);
      setShowModal(null);
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