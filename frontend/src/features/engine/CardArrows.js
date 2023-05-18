import React, { useMemo } from "react";
import { ArcherElement } from "react-archer";
import { useSelector } from "react-redux";

const arrowDivStyle = {
  position: 'relative',
  width: '0px',
  height: '0px',
  top: '50%',
  left: '50%',
  zIndex: 1e5,
  background: "red"
};

export const CardArrows = React.memo(({ cardId }) => {
  const cardArrows = useSelector(state => state?.gameUi?.game?.cardById[cardId]?.arrows);

  const arrowElements = useMemo(() => {
    return Object.entries(cardArrows).map(([playerI, playerIArrows]) => {
      const arrowRelations = playerIArrows?.map(destCardId => ({
        targetId: "arrow-" + destCardId,
        targetAnchor: 'middle',
        sourceAnchor: 'bottom'
      }));
      console.log("Arrow relations", arrowRelations);
      return (
        <ArcherElement
          key={playerI}
          id={"arrow-" + cardId}
          relations={arrowRelations}
        >
          <div style={arrowDivStyle} />
        </ArcherElement>
      );
    });
  }, [cardArrows, cardId]);

  return <>{arrowElements}</>;
});
