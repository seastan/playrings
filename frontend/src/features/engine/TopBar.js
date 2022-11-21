import React from "react";
import { TopBarMenu } from "../plugins/lotrlcg/components/TopBarMenu";
import { TopBarView } from "./TopBarView";
import { TopBarDataContainer } from "./TopBarDataContainer";
import { useGameL10n } from "../../hooks/useGameL10n";
import { useDispatch } from "react-redux";
import { setShowModal } from "../store/playerUiSlice";

export const TopBar = React.memo(({}) => {
  console.log("Rendering TopBar");
  const l10n = useGameL10n();
  const dispatch = useDispatch();
  return(
    <div className="h-full">
      <ul className="top-level-menu float-left">
        <TopBarMenu/>
        <TopBarView/>
        <li onClick={() => {dispatch(setShowModal("builder"))}} key={"Builder"}><div className="h-full flex items-center justify-center select-none">{l10n("Builder")}</div></li>
      </ul>
      <TopBarDataContainer/>
    </div>
  )
})