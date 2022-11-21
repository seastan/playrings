import React from "react";
import { getVisibleFace, getVisibleFaceSrc } from "../plugins/lotrlcg/functions/helpers";
import useProfile from "../../hooks/useProfile";
import { useSelector } from "react-redux";
import { useGameDefinition } from "./functions/useGameDefinition";

export const GiantCard = React.memo(({}) => {
  const user = useProfile();
  const gameDef = useGameDefinition();
  const playerN = useSelector(state => state?.playerUi?.playerN);
  const touchAction = useSelector(state => state?.playerUi?.touchAction);
  const activeCardObj = useSelector(state => state?.playerUi?.activeCardObj);
  const activeCard = activeCardObj?.card;
  const visibleFace = getVisibleFace(activeCard, playerN);
  const visibleFaceSrc = getVisibleFaceSrc(visibleFace, user, gameDef);
  console.log("Rendering GiantCard", activeCard, visibleFace, visibleFaceSrc);


  if (activeCard && !touchAction) {
    var height = visibleFace.height >= visibleFace.width ? "70vh" : "50vh";
    if (user?.language === "English_HD") height = visibleFace.height >= visibleFace.width ? "90vh" : "70vh";
    return (
      <img 
        className="absolute"
        src={visibleFaceSrc.src} 
        onError={(e)=>{e.target.onerror = null; e.target.src=visibleFaceSrc.default}}
        style={{
          right: activeCardObj?.screenPosition === "left" ? "3%" : "",
          left: activeCardObj?.screenPosition === "right" ? "3%" : "",
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