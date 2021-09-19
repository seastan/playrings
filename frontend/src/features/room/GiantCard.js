import React from "react";
import { useActiveCard } from "../../contexts/ActiveCardContext";
import { useTouchAction } from "../../contexts/TouchActionContext";
import { getVisibleFace, getVisibleFaceSrc } from "./Helpers";
import useProfile from "../../hooks/useProfile";

export const GiantCard = React.memo(({playerN}) => {
  console.log("Rendering GiantCard");
  const user = useProfile();
  const touchAction = useTouchAction();
  const activeCardAndLoc = useActiveCard();
  const activeCard = activeCardAndLoc?.card;
  const visibleFace = getVisibleFace(activeCard, playerN);
  const visibleFaceSrc = getVisibleFaceSrc(activeCard, playerN, user);
  if (activeCard && !touchAction) {
    return (
      <img 
        className="absolute"
        src={visibleFaceSrc.src} onerror={`this.onerror=null; this.src=${visibleFaceSrc.default}`}
        style={{
          right: activeCardAndLoc?.screenPosition === "left" ? "3%" : "",
          left: activeCardAndLoc?.screenPosition === "right" ? "3%" : "",
          top: "5%",
          borderRadius: '5%',
          MozBoxShadow: '0 0 50px 20px black',
          WebkitBoxShadow: '0 0 50px 20px black',
          boxShadow: '0 0 50px 20px black',
          zIndex: 1e6,
          height: visibleFace.height >= visibleFace.width ? "70vh" : "50vh",
        }}
      />
    )
  } else {
    return(null)
  }
})

export default GiantCard;