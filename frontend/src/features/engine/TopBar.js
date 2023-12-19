import React from "react";
import { TopBarMenu } from "./TopBarMenu";
import { TopBarView } from "./TopBarView";
import { TopBarDataContainer } from "./TopBarDataContainer";
import { useGameL10n } from "./hooks/useGameL10n";
import { useDispatch } from "react-redux";
import { setShowModal } from "../store/playerUiSlice";
import { useGameDefinition } from "./hooks/useGameDefinition";

export const TopBar = React.memo(({}) => {
  console.log("Rendering TopBar");
  const l10n = useGameL10n();
  const dispatch = useDispatch();
  const gameDef = useGameDefinition();
  const deckbuilder = gameDef.deckbuilder;
  return(
    <div className="h-full">
      <ul className="top-level-menu float-left">
        <TopBarMenu/>
        <TopBarView/>
        <li onClick={() => {deckbuilder ? dispatch(setShowModal("builder")) : alert("Deckbuilder for this game is currently unsupported.")}} key={"Builder"}><div className="h-full flex items-center justify-center select-none">{l10n("Builder")}</div></li>
      </ul>
      <TopBarDataContainer/>
    </div>
  )
})