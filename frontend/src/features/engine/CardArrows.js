import React, { useMemo } from "react";
import { ArcherElement } from "react-archer";
import { useSelector } from "react-redux";

const colorMap = {
  "player1": "rgba(255,0,0,0.6)",
  "player2": "rgba(0,200,0,0.6)",
  "player3": "rgba(0,128,255,0.6)",
  "player4": "rgba(128,0,255,0.6)",
  "player5": "rgba(255,128,0,0.6)",
  "player6": "rgba(0,255,255,0.6)",
  "player7": "rgba(255,150,255,0.6)",
  "player8": "rgba(255,255,0,0.6)",
}

const getArrowColor = (playerI) => {
  // If not present in colorMap, return black
  return colorMap[playerI] || "black";
}

const arrowDivStyle = {
  position: 'relative',
  width: '0px',
  height: '0px',
  top: '50%',
  left: '50%',
  zIndex: 1e5
};

export const CardArrows = React.memo(({ cardId }) => {
  const cardArrows = useSelector(state => state?.gameUi?.game?.cardById[cardId]?.arrows);


  const arrowElements = useMemo(() => {
    const arrowRelations = [];
    Object.entries(cardArrows).map(([playerI, playerIArrows]) => {
      for (var destCardId of playerIArrows) {
        arrowRelations.push({
          targetId: "arrow-" + destCardId,
          targetAnchor: 'middle',
          sourceAnchor: 'bottom',
          style: {
            strokeColor: getArrowColor(playerI),
            strokeOpacity: 0.5,
          }
        });
      }
    });
    console.log("Arrow relations", arrowRelations);
    return (
      <ArcherElement
        id={"arrow-" + cardId}
        relations={arrowRelations}
      >
        <div style={arrowDivStyle} />
      </ArcherElement>
    );
  }, [cardArrows, cardId]);

  return <>{arrowElements}</>;
});
