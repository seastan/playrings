import React from "react";
import { useSelector } from "react-redux";
import { usePlayerN } from "./hooks/usePlayerN";

export const Prompts = React.memo(({
}) => {
  const playerN = usePlayerN();
  const prompts = useSelector(state => state?.gameUi?.game?.playerData?.[playerN]?.prompts); 
  if (!prompts) return null;

  return (
    <div className="absolute text-white bg-gray-600-90" 
      style={{
        left: "80%", 
        top: "2%", 
        width: "19%",
        zIndex: 3e3,
        MozBoxShadow: '0 0 50px 20px black',
        WebkitBoxShadow: '0 0 50px 20px black',
        boxShadow: '0 0 50px 20px black',
      }}>
        {Object.keys(prompts).map((promptKey, index) => {
          return(
            <div key={index} className="m-2">
                {prompts[promptKey]["message"]}
            </div>
          )
        })}
  </div>
  )
})