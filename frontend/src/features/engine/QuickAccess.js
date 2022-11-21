import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FavoriteGroupModal } from "./FavoriteGroupModal";
import { setShowModal, setSideGroupId } from "../store/playerUiSlice";

export const QuickAccess = React.memo(({}) => {
  const dispatch = useDispatch();
  const groupById = useSelector(state => state?.gameUi?.game?.groupById);
  const observingPlayerN = useSelector(state => state?.playerUi?.observingPlayerN);
  const favoriteGroupId = useSelector(state => state?.playerUi?.favoriteGroupId);
  const sideGroupId = useSelector(state => state?.playerUi?.sideGroupId);
  const showModal = useSelector(state => state?.playerUi?.showModal);

  const handleQuickViewClick = (groupId) => {
    if (sideGroupId === groupId) dispatch(setSideGroupId(null));
    else dispatch(setSideGroupId(groupId));
  }
  const handleFavoriteClick = () => {
    if (!favoriteGroupId) dispatch(setShowModal("favorite"));
    else if (sideGroupId === favoriteGroupId) dispatch(setSideGroupId(null));
    else dispatch(setSideGroupId(favoriteGroupId));
  }

  const groupIds = ["sharedSetAside", observingPlayerN+"Sideboard", "sharedVictory", "sharedEncounterDeck2"];
  const labels = ["SA", "SB", "VD", "E2"];

  return (        
    <div className="absolute h-full cursor-default text-center text-gray-400 right-0 overflow-y-hidden" style={{width:"30px", background:"rgba(0, 0, 0, 0.3)", zIndex: 1e3+1}}>
      {groupIds.map((groupId, groupIndex) => (
        <div key={groupIndex} className={`h-1/5 w-full bg-gray-800 ${sideGroupId === groupId ? "bg-red-800" : "hover:bg-gray-600"}`} onClick={() => handleQuickViewClick(groupId)}>
          <div className="h-1/2 w-full flex items-center justify-center">{labels[groupIndex]}</div>
          <div className="h-1/2 w-full flex items-center justify-center">{groupById[groupId]?.stackIds.length}</div>
        </div>
      ))}

      <div 
        className={`h-1/5 w-full bg-gray-800 flex items-center justify-center ${sideGroupId === favoriteGroupId ? "bg-red-800" : "hover:bg-gray-600"}`}
        onClick={() => handleFavoriteClick()}>
        <FontAwesomeIcon icon={faStar}/>
      </div>
      {showModal === "favorite" ? <FavoriteGroupModal/> : null}
    </div>
  )
})