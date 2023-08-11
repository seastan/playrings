import React, { useEffect, useRef } from "react";
import useProfile from "../../hooks/useProfile";
import { useDispatch, useSelector } from "react-redux";
import { useVisibleFace } from "./hooks/useVisibleFace";
import { useVisibleFaceSrc } from "./hooks/useVisibleFaceSrc";
import { useActiveCardId } from "./hooks/useActiveCardId";
import { setActiveCardId } from "../store/playerUiSlice";

export const GiantCard = React.memo(({}) => {
  const user = useProfile();
  const dispatch = useDispatch();
  const touchAction = useSelector(state => state?.playerUi?.touchAction);
  const activeCardId = useActiveCardId();
  const activeCardGroupId = useSelector(state => state?.gameUi?.game?.cardById?.[activeCardId]?.groupId);
  const prevActiveCardGroupIdRef = useRef(activeCardGroupId);
  const visibleFace = useVisibleFace(activeCardId);
  const screenLeftRight = useSelector(state => state?.playerUi?.screenLeftRight);
  const visibleFaceSrc = useVisibleFaceSrc(activeCardId);
  console.log("Rendering GiantCard", visibleFace, visibleFaceSrc);

  useEffect(() => {
  
    // Check if activeCardId is not null
    if (activeCardId !== null) {
      // Check if activeCardGroupId has changed from its previous value
      if (activeCardGroupId !== prevActiveCardGroupIdRef.current && prevActiveCardGroupIdRef.current) {
        // Dispatch the action to set activeCardId to null
        dispatch(setActiveCardId(null));
      }
    }

    // Update the ref with the current value of activeCardGroupId
    prevActiveCardGroupIdRef.current = activeCardGroupId;
  }, [activeCardId, activeCardGroupId, dispatch]);

  if (activeCardId && !touchAction) {
    var height = visibleFace.height >= visibleFace.width ? "70vh" : "50vh";
    if (user?.language === "English_HD") height = visibleFace.height >= visibleFace.width ? "90vh" : "70vh";
    return (
      <img 
        className="absolute"
        src={visibleFaceSrc.src} 
        onError={(e)=>{e.target.onerror = null; e.target.src=visibleFaceSrc.default}}
        style={{
          right: screenLeftRight === "left" ? "3%" : "",
          left: screenLeftRight === "right" ? "3%" : "",
          top: "5%",
          borderRadius: '5%',
          MozBoxShadow: '0 0 50px 20px black',
          WebkitBoxShadow: '0 0 50px 20px black',
          boxShadow: '0 0 50px 20px black',
          zIndex: 1e6,
          height: height,
        }}
      />
    )
  } else {
    return(null)
  }
})

export default GiantCard;