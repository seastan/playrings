import React, { useRef } from "react";
import useProfile from "../../hooks/useProfile";
import { useDispatch, useSelector } from "react-redux";
import { useVisibleFace } from "./hooks/useVisibleFace";
import { useVisibleFaceSrc } from "./hooks/useVisibleFaceSrc";
import { useActiveCardId } from "./hooks/useActiveCardId";
import { useGameDefinition } from "./hooks/useGameDefinition";
import { useTouchAction } from "./hooks/useTouchAction";

export const GiantCard = React.memo(({}) => {
  const gameDef = useGameDefinition();
  const dispatch = useDispatch();
  const touchAction = useTouchAction();
  const activeCardId = useActiveCardId();
  const visibleFace = useVisibleFace(activeCardId);
  const screenLeftRight = useSelector(state => state?.playerUi?.screenLeftRight);
  const visibleFaceSrc = useVisibleFaceSrc(activeCardId);
  console.log("Rendering GiantCard", visibleFace, visibleFaceSrc);

  if (!visibleFace) return(null);

  const cardType = visibleFace?.type;
  const zoomFactor = gameDef?.cardTypes?.[cardType]?.zoomFactor;
  var height = zoomFactor ? `${zoomFactor*95}vh` : "70vh";
  if (visibleFace.height < visibleFace.width) height = "50vh"; // Need to make sure we aren't crossing the middle of the screen or else the GiantCard could cover the small card and mess up with the mouseover actions.

  if (activeCardId && !touchAction) {
    //var height = visibleFace.height >= visibleFace.width ? "70vh" : "50vh";
    //if (user?.language === "English_HD") height = visibleFace.height >= visibleFace.width ? "90vh" : "70vh";
    return (
      <img 
        className="absolute"
        src={visibleFaceSrc.src} 
        onError={(e)=>{e.target.onerror = null; e.target.src=visibleFaceSrc.default}}
        style={{
          right: screenLeftRight === "left" ? "3%" : "",
          left: screenLeftRight === "right" ? "3%" : "",
          top: "0%",
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