import React, { Component } from "react";
import { useActiveCard } from "../../contexts/ActiveCardContext";
import { getVisibleFace, getVisibleFaceSRC } from "./Helpers";

export const GiantCard = ({playerN}) => {
  const activeCardAndLoc = useActiveCard();
  const activeCard = activeCardAndLoc?.card
  const visibleFace = getVisibleFace(activeCard, playerN)
  if (activeCard) {
    return (
      <img 
        className="absolute"
        src={getVisibleFaceSRC(activeCard, playerN)}
        style={{
          right: activeCardAndLoc?.screenPosition === "left" ? "3%" : "",
          left: activeCardAndLoc?.screenPosition === "right" ? "3%" : "",
          top: "5%",
          borderRadius: '5%',
          backgroundColor: "red",
          MozBoxShadow: '0 0 50px 20px black',
          WebkitBoxShadow: '0 0 50px 20px black',
          boxShadow: '0 0 50px 20px black',
          zIndex: 1e6,
          width: visibleFace.height >= visibleFace.width ? "25%" : "35%",
        }}
      >
      </img>
    )
  } else {
    return(null)
  }
}

export default GiantCard;