import React, {useEffect, useState} from "react";
import { useDispatch, useSelector } from 'react-redux';
import ReactModal from "react-modal";
import { setShowModal, setTyping, setUserSettings } from "../store/playerUiSlice";
import { useGameL10n } from "./hooks/useGameL10n";
import { useGameDefinition } from "./hooks/useGameDefinition";
import { useSiteL10n } from "../../hooks/useSiteL10n";
import { usePlugin } from "./hooks/usePlugin";
import useProfile from "../../hooks/useProfile";
import Axios from "axios";
import { deepUpdate } from "../store/updateValues";
import { useAuthOptions } from "../../hooks/useAuthOptions";
import Button from "../../components/basic/Button";
import { useDoActionList } from "./hooks/useDoActionList";
import { usePlayerN } from "./hooks/usePlayerN";
import store from "../../store";

// Move to another file, use this to set the default falues in playerUiSlice
export const uiSettings = {
  "backgroundUrl": {
    "id": "backgroundUrl",
    "label": "backgroundUrl",
    "type": "string",
    "default": "",
    "supporterLevel": 5
  },
  "zoomPercent": {
    "id": "zoomPercent",
    "label": "zoomPercent",
    "type": "integer",
    "default": 100
  },
  "touchMode": {
    "id": "touchMode",
    "label": "touchMode",
    "type": "boolean",
    "default": false
  },
}

export const SettingsModal = React.memo(({}) => {
    const dispatch = useDispatch();

    return(
      <ReactModal
        closeTimeoutMS={200}
        isOpen={true}
        onRequestClose={() => dispatch(setShowModal(null))}
        contentLabel={"Load quest"}
        overlayClassName="fixed inset-0 bg-black-50 z-10000"
        className="insert-auto p-5 bg-gray-700 border max-h-lg mx-auto my-2 rounded-lg outline-none"
        style={{
          content: {
            width: "800px",
            maxHeight: "95vh",
            overflowY: "scroll",
          }
        }}>
        <ModalContent/>
      </ReactModal>  
    )
})

const ModalContent = () => {
  const dispatch = useDispatch();
  const doActionList = useDoActionList();
  const user = useProfile();
  const authOptions = useAuthOptions();
  const plugin = usePlugin();
  const gameDef = useGameDefinition();
  const stateBackgroundUrl = useSelector(state => state?.playerUi?.userSettings?.backgroundUrl);
  const databasePlayerSettings = user?.plugin_settings?.[plugin?.id]?.player;
  const databaseGameSettings = user?.plugin_settings?.[plugin?.id]?.game;
  const databaseUiSettings = user?.plugin_settings?.[plugin?.id]?.ui;
  const gameDefPlayerProperties = gameDef?.playerProperties;
  const gameDefGameProperties = gameDef?.gameProperties;
  const playerN = usePlayerN();
  const siteL10n = useSiteL10n();
  const gameL10n = useGameL10n();
  const [currentUiSettings, setCurrentUiSettings] = useState({});
  const [currentUiSettingMode, setCurrentUiSettingsMode] = useState({});
  const [currentPlayerSettings, setCurrentPlayerSettings] = useState({});
  const [currentPlayerSettingMode, setCurrentPlayerSettingsMode] = useState({});
  const [currentGameSettings, setCurrentGameSettings] = useState({});
  const [currentGameSettingMode, setCurrentGameSettingsMode] = useState({});
  const [onRenderPlayerSettings, setOnRenderPlayerSettings] = useState({});
  const [onRenderGameSettings, setOnRenderGameSettings] = useState({});

  // Filter out keys in the game definition if their value (which is an object) does not have a showInSettings = true property
  const gameDefPlayerSettings = Object.keys(gameDefPlayerProperties).reduce((obj, key) => {
    if (gameDefPlayerProperties[key].showInSettings) {
      obj[key] = gameDefPlayerProperties[key];
      obj[key].id = key;
    }
    return obj;
  }, {});

  const gameDefGameSettings = Object.keys(gameDefGameProperties).reduce((obj, key) => {
    if (gameDefGameProperties[key].showInSettings) {
      obj[key] = gameDefGameProperties[key];
      obj[key].id = key;
    }
    return obj;
  }, {});

  console.log("userSettings ", user?.plugin_settings);
  console.log("render player2Settings", store.getState()?.gameUi?.game?.playerData?.["player2"]);

  useEffect(() => {
    dispatch(setTyping(true));
    const state = store.getState();
    const statePlayerProperties = state?.gameUi?.game?.playerData?.[playerN];
    const stateGameProperties = state?.gameUi?.game;
    const stateUiProperties = state?.playerUi?.userSettings;

    // Get state settings
    const statePlayerSettings = {};
    const databasePlayerSettingsMode = {};
    if (statePlayerProperties) {
      for (const key of Object.keys(gameDefPlayerSettings)) {
        statePlayerSettings[key] = statePlayerProperties[key];
        if (databasePlayerSettings?.[key] !== undefined) {
          databasePlayerSettingsMode[key] = "allGames";
        } else {
          databasePlayerSettingsMode[key] = "thisGame";
        }
      }
    }
    const stateGameSettings = {};
    const databaseGameSettingsMode = {};
    if (stateGameProperties) {
      for (const key of Object.keys(gameDefGameSettings)) {
        stateGameSettings[key] = stateGameProperties[key];
        if (databaseGameSettings?.[key] !== undefined) {
          databaseGameSettingsMode[key] = "allGames";
        } else {
          databaseGameSettingsMode[key] = "thisGame";
        }
      }
    }
    const stateUiSettings = {};
    const databaseUiSettingsMode = {};
    for (const key of Object.keys(uiSettings)) {
      stateUiSettings[key] = stateUiProperties[key];
      if (databaseUiSettings?.[key] !== undefined) {
        databaseUiSettingsMode[key] = "allGames";
      } else {
        databaseUiSettingsMode[key] = "thisGame";
      }
    }
    console.log("useEffect UI settings", stateBackgroundUrl, stateUiProperties, stateUiSettings, databaseUiSettings)

    setOnRenderPlayerSettings(statePlayerSettings);
    setOnRenderGameSettings(stateGameSettings);
    // No need to set onRenderUiSettings because we always apply it even if it's unchanged

    setCurrentPlayerSettings(statePlayerSettings);
    setCurrentGameSettings(stateGameSettings);
    setCurrentUiSettings(stateUiSettings);

    setCurrentPlayerSettingsMode(databasePlayerSettingsMode);
    setCurrentGameSettingsMode(databaseGameSettingsMode);
    setCurrentUiSettingsMode(databaseUiSettingsMode);


    // const stateUiSettings = state?.playerUi?.userSettings;
    // const databaseUiSettingsMode = {};
    // for (const key of Object.keys(uiSettings)) {
    //   if (databaseUiSettings?.[key] !== undefined) {
    //     databaseUiSettingsMode[key] = "allGames";
    //   } else {
    //     databaseUiSettings[key] = uiSettings[key].default;
    //     databaseUiSettingsMode[key] = "thisGame";
    //   }
    // }
    // console.log("setCurrentUiSettings", databaseUiSettings, databaseUiSettingsMode)
    // setCurrentUiSettings(databaseUiSettings);
    // setCurrentUiSettingsMode(databaseUiSettingsMode);

    
  }, [playerN, stateBackgroundUrl]);


  const handleInputChange = (settingType, id, value) => {
    switch (settingType) {
      case "player":
        setCurrentPlayerSettings(prevSettings => ({
          ...prevSettings,
          [id]: value
        }));
        break;
      case "game":
        setCurrentGameSettings(prevSettings => ({
          ...prevSettings,
          [id]: value
        }));
        break;
      case "ui":
        setCurrentUiSettings(prevSettings => ({
          ...prevSettings,
          [id]: value
        }));
        break;
      default:
        break;
    }
  };

  const handleModeChange = (settingType, id, value) => {
    switch (settingType) {
      case "player":
        setCurrentPlayerSettingsMode(prevSettings => ({
          ...prevSettings,
          [id]: value
        }));
        break;
      case "game":
        setCurrentGameSettingsMode(prevSettings => ({
          ...prevSettings,
          [id]: value
        }));
        break;
      case "ui":
        setCurrentUiSettingsMode(prevSettings => ({
          ...prevSettings,
          [id]: value
        }));
        break;
      default:
        break;
    }
  };

  const handleSave = async () => {
    var url = currentPlayerSettings["background_url"];
    if (url && !(url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg"))) {
      alert(siteL10n("altArtFormatError"))
      return;
    }
    if (url === "") {
      url = null;
    }

    const permanentPlayerSettings = {};
    const permanentGameSettings = {};
    const permanentUiSettings = {};
    
    // Determine the values for this game (which will be pushed to backend) 
    // and all games (which will be pushed to backend and saved to user profile)
    for (const key of Object.keys(gameDefPlayerSettings)) {
      if (currentPlayerSettingMode[key] === "allGames") {
        permanentPlayerSettings[key] = currentPlayerSettings[key];
      }
    }
    for (const key of Object.keys(gameDefGameSettings)) {
      if (currentGameSettingMode[key] === "allGames") {
        permanentGameSettings[key] = currentGameSettings[key];
      }
    }
    console.log("uiSettings", uiSettings, currentUiSettings, currentUiSettingMode);
    for (const key of Object.keys(uiSettings)) {
      if (currentUiSettingMode[key] === "allGames") {
        permanentUiSettings[key] = currentUiSettings[key];
      }
    }
    console.log("uiSettings", uiSettings, currentUiSettings, currentUiSettingMode, );

    // Update the database
    const newDatabasePluginSettings = {
      [plugin.id]: {
        player: permanentPlayerSettings,
        game: permanentGameSettings,
        ui: permanentUiSettings,
      }
    };
    
    // If any settings are being updated, update the database
    const res = await Axios.post("/be/api/v1/profile/update_plugin_user_settings", newDatabasePluginSettings, authOptions);

    const pluginSettings = user.plugin_settings;
    deepUpdate(pluginSettings, newDatabasePluginSettings);
    const newProfileData = {
      user_profile: {
        ...user,
        plugin_settings: pluginSettings
      }}

    user.setData(newProfileData);
    if (res.status !== 200) {
      alert(siteL10n("settingUpdateError")); 
    }
    
    // Update the game
    const actionList = [];
    for (const key of Object.keys(currentPlayerSettings)) {
      const label = gameDefPlayerProperties[key].label;
      const value = currentPlayerSettings[key];
      if (value !== onRenderPlayerSettings[key]) {
        actionList.push(["SET", `/playerData/$PLAYER_N/${key}`, value]);
        actionList.push(["LOG", `{{$ALIAS_N}} set thier ${label} to ${value}.`]);
      }
    }
    for (const key of Object.keys(currentGameSettings)) {
      const label = gameDefGameProperties[key].label;
      const value = currentGameSettings[key];
      if (value !== onRenderGameSettings[key]) {
        actionList.push(["SET", `/${key}`, value]);
        actionList.push(["LOG", `{{$ALIAS_N}} set the ${label} to ${value}.`]);
      }
    }

    if (actionList.length > 0) {
      doActionList(actionList);
    }

    // Update the UI settings
    dispatch(setUserSettings(currentUiSettings));

    // Close the modal
    dispatch(setTyping(false));
    dispatch(setShowModal(null));
  }

  const renderModeElement = (settingType, settingDict, propertyObj) => {
    return (
      <select
        className="p-2 w-48"
        value={settingDict[propertyObj.id]}
        onChange={(e) => handleModeChange(settingType, propertyObj.id, e.target.value)}
      >
        <option key={"thisGame"} value={"thisGame"}>{siteL10n("thisGame")}</option>
        <option key={"allGames"} value={"allGames"}>{siteL10n("allGames")}</option>
      </select>
    );
  };

  const renderFormElement = (settingType, settingDict, propertyObj) => {
    console.log("renderFormElement", settingType, settingDict, propertyObj)
    switch (propertyObj.type) {
      case 'integer':
        return (
          <input
            type="number"
            className="p-1 w-16"
            value={settingDict[propertyObj.id]}
            onChange={(e) => handleInputChange(settingType, propertyObj.id, parseInt(e.target.value))}
          />
        );
      case 'string':
        return (
          propertyObj.supporterLevel > user?.supporter_level ?
            <button 
              className="flex items-center justify-center rounded text-white bg-gray-800 hover:bg-gray-700 p-1 px-4"
              onClick={() => {dispatch(setShowModal("patreon"))}}
              >
              <span>Unlock</span>
              <img className="ml-2" style={{height: "20px"}} src="https://upload.wikimedia.org/wikipedia/commons/9/94/Patreon_logo.svg" alt="Patreon logo"/>
            </button>
            :
            <input
              disabled={propertyObj.supporterLevel > user?.supporter_level}
              type="text"
              className="p-1 w-48"
              value={settingDict[propertyObj.id]}
              onChange={(e) => handleInputChange(settingType, propertyObj.id, e.target.value)}
            />
        );
      case 'option':
        return (
          <select
            className="p-2 w-48"
            value={settingDict[propertyObj.id]}
            onChange={(e) => handleInputChange(settingType, propertyObj.id, e.target.value)}
          >
            {propertyObj.options.map(option => (
              <option key={option.id} value={option.id}>{gameL10n(option.label)}</option>
            ))}
          </select>
        );
      case 'boolean':
        return (
          <input
            type="checkbox"
            className="p-1"
            checked={settingDict[propertyObj.id]}
            onChange={(e) => handleInputChange(settingType, propertyObj.id, e.target.checked)}
          />
        );
      default:
        return null;
    }
  };

  return(
    <div className="text-white">
      <h1 className="mb-2">{siteL10n("uiPreferences")}</h1>
      <table className="w-full text-sm mb-2">
        <tbody>
          {Object.keys(uiSettings).map((propertyId, index) => {
            const propertyObj = uiSettings[propertyId];
            return (
              <tr key={propertyObj.id} className={index % 2 === 0 ? "bg-gray-600" : "bg-gray-700"}>
                <td className="px-4 py-2 w-1/3">{siteL10n(propertyObj.label)}</td>
                <td className="px-4 py-2 w-1/3 text-black">{renderFormElement("ui", currentUiSettings, propertyObj)}</td>
                <td className="px-4 py-2 w-1/3 text-black">{renderModeElement("ui", currentUiSettingMode, propertyObj)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <h1 className="mb-2">{siteL10n("playerPreferences")}</h1>
      <table className="w-full text-sm mb-2">
        <tbody>
          {Object.keys(gameDefPlayerSettings).map((propertyId, index) => {
            const propertyObj = gameDefPlayerSettings[propertyId];
            if (!propertyObj.showInSettings) return null;
            else return (
              <tr key={propertyId} className={index % 2 === 0 ? "bg-gray-600" : "bg-gray-800"}>
                <td className="px-4 py-2 w-1/3">{gameL10n(propertyObj.label)}</td>
                <td className="px-4 py-2 w-1/3 text-black">{renderFormElement("player", currentPlayerSettings, propertyObj)}</td>
                <td className="px-4 py-2 w-1/3 text-black">{renderModeElement("player", currentPlayerSettingMode, propertyObj)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <h1 className="mb-2">{siteL10n("gamePreferences")}</h1>
      <table className="w-full text-sm mb-2">
        <tbody>
          {Object.keys(gameDefGameSettings).map((propertyId, index) => {
            const propertyObj = gameDefGameSettings[propertyId];
            if (!propertyObj.showInSettings) return null;
            else return (
              <tr key={propertyId} className={index % 2 === 0 ? "bg-gray-600" : "bg-gray-800"}>
                <td className="px-4 py-2 w-1/3">{gameL10n(propertyObj.label)}</td>
                <td className="px-4 py-2 w-1/3 text-black">{renderFormElement("game", currentGameSettings, propertyObj)}</td>
                <td className="px-4 py-2 w-1/3 text-black">{renderModeElement("game", currentGameSettingMode, propertyObj)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="flex items-center justify-between">
        <Button isSubmit isPrimary className="my-2 w-64" onClick={handleSave}>
          Update
        </Button>
      </div>
    </div>
  );
}
