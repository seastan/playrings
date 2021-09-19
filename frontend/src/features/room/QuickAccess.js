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

  return (        
    <div className="absolute h-full cursor-default text-center text-gray-400 right-0 overflow-y-hidden" style={{width:"30px", background:"rgba(0, 0, 0, 0.3)", zIndex: 1e6+1}}>
      <div className={`h-1/4 w-full bg-gray-800 hover:bg-gray-600 ${sideGroupId === "sharedSetAside" ? "bg-gray-700" : ""}`} onClick={() => handleQuickViewClick("sharedSetAside")}>
        <div className="h-1/2 w-full flex items-center justify-center">SA</div>
        <div className="h-1/2 w-full flex items-center justify-center">{groupById["sharedSetAside"].stackIds.length}</div>
      </div>
      <div className={`h-1/4 w-full bg-gray-800 hover:bg-gray-600 ${sideGroupId === observingPlayerN+"Sideboard" ? "bg-gray-700" : ""}`} onClick={() => handleQuickViewClick(observingPlayerN+"Sideboard")}>
        <div className="h-1/2 w-full flex items-center justify-center">SB</div>
        <div className="h-1/2 w-full flex items-center justify-center">{groupById[observingPlayerN+"Sideboard"]?.stackIds.length}</div>
      </div>
      <div className={`h-1/4 w-full bg-gray-800 hover:bg-gray-600 ${sideGroupId === "sharedVictory" ? "bg-gray-700" : ""}`} onClick={() => handleQuickViewClick("sharedVictory")}>
        <div className="h-1/2 w-full flex items-center justify-center">VD</div>
        <div className="h-1/2 w-full flex items-center justify-center">{groupById["sharedVictory"].stackIds.length}</div>
      </div>
      <div 
        className="h-1/4 w-full bg-gray-800 hover:bg-gray-600 flex items-center justify-center" 
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