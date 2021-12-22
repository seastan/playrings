import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { useObservingPlayerN } from "../../contexts/ObservingPlayerNContext";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FavoriteGroupModal } from "./FavoriteGroupModal";

export const QuickAccess = React.memo(({sideGroupId, setSideGroupId}) => {
  const groupByIdStore = state => state.gameUi.game.groupById;
  const groupById = useSelector(groupByIdStore);
  const observingPlayerN = useObservingPlayerN();
  const [showModal, setShowModal] = useState(false);
  const [favoriteGroupId, setFavoriteGroupId] = useState(null);

  const handleQuickViewClick = (groupId) => {
    if (sideGroupId === groupId) setSideGroupId(null);
    else setSideGroupId(groupId);
  }
  const handleFavoriteClick = () => {
    if (!favoriteGroupId) setShowModal(true);
    else if (sideGroupId === favoriteGroupId) setSideGroupId(null);
    else setSideGroupId(favoriteGroupId);
  }

  const groupIds = ["sharedSetAside", observingPlayerN+"Sideboard", "sharedVictory", "sharedEncounterDeck2"];
  const labels = ["SA", "SB", "VD", "E2"];

  return (        
    <div className="absolute h-full cursor-default text-center text-gray-400 right-0 overflow-y-hidden" style={{width:"30px", background:"rgba(0, 0, 0, 0.3)", zIndex: 1e6+1}}>
      {groupIds.map((groupId, groupIndex) => (
        <div className={`h-1/5 w-full bg-gray-800 ${sideGroupId === groupId ? "bg-red-800" : "hover:bg-gray-600"}`} onClick={() => handleQuickViewClick(groupId)}>
          <div className="h-1/2 w-full flex items-center justify-center">{labels[groupIndex]}</div>
          <div className="h-1/2 w-full flex items-center justify-center">{groupById[groupId]?.stackIds.length}</div>
        </div>
      ))}

      <div 
        className={`h-1/5 w-full bg-gray-800 flex items-center justify-center ${sideGroupId === favoriteGroupId ? "bg-red-800" : "hover:bg-gray-600"}`}
        onClick={() => handleFavoriteClick()}>
        <FontAwesomeIcon 
          icon={faStar}/>
      </div>
      <FavoriteGroupModal
        isOpen={showModal}
        closeModal={() => setShowModal(false)}
        favoriteGroupId={favoriteGroupId}
        setFavoriteGroupId={setFavoriteGroupId}
        setSideGroupId={setSideGroupId}
      />
    </div>
  )
})