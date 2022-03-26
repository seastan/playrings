import React from "react";
import { TopBarMenu } from "./TopBarMenu";
import { TopBarView } from "./TopBarView";
import { TopBarDataContainer } from "./TopBarDataContainer";

export const TopBar = React.memo(({}) => {
  console.log("Rendering TopBar");
  return(
    <div className="h-full">
      <ul className="top-level-menu float-left">
        <TopBarMenu
        />
        <TopBarView/>
      </ul>
      <TopBarDataContainer
      />
    </div>
  )
})