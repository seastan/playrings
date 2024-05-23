import React, { useEffect, useState, useContext } from "react";
import MessageLines from "./MessageLines";
import { useSelector } from "react-redux";
import { LogMessageDiv } from "./LogMessageDiv";

export const LogDiv = ({ hover }) => {
  const deltas = useSelector(state => state?.gameUi?.deltas);

  console.log("Rendering Log", deltas)

  const allLogMessageDivs = deltas.map((delta, deltaIndex) => {
    return(<LogMessageDiv key={deltaIndex} delta={delta} deltaIndex={deltaIndex}/>)
  })

  console.log("Rendering allLogMessageDivs", allLogMessageDivs)

  return (
    <div className="flex flex-col" style={{height: "100%"}}>
      <div className="bg-gray-900 overflow-y-auto" style={{height: `calc(100%)`}}>
        <MessageLines hover={hover} messageDivs={allLogMessageDivs} />
      </div>
    </div>

  )
}