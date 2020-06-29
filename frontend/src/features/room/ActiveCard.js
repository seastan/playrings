import React from "react";
import { useActiveCard } from "../../contexts/ActiveCardContext";

export const ActiveCard = () => {
    const activeCard = useActiveCard();
    return (
        <div className="h-full" 
            style={{
              backgroundImage: `url(${activeCard?.src})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              backgroundPosition: "center",
            }}
          >
        </div>
    )
  }
  
  export default ActiveCard;