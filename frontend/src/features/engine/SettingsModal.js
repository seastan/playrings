import React, {useEffect, useState} from "react";
import { useDispatch } from 'react-redux';
import ReactModal from "react-modal";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DropdownItem, GoBack } from "./DropdownMenuHelpers";
import { setShowModal, setTyping } from "../store/playerUiSlice";
import { useGameL10n } from "./hooks/useGameL10n";
import { useGameDefinition } from "./hooks/useGameDefinition";
import { useSiteL10n } from "../../hooks/useSiteL10n";
import { useLoadPrebuiltDeck } from "./hooks/useLoadPrebuiltDeck";
import { usePlugin } from "./hooks/usePlugin";
import useProfile from "../../hooks/useProfile";
import Axios from "axios";
import { deepUpdate } from "../store/updateValues";
import { useAuthOptions } from "../../hooks/useAuthOptions";
import Button from "../../components/basic/Button";
import { el } from "date-fns/locale";
import { useDoActionList } from "./hooks/useDoActionList";

const uiSettings = [
  {
      "id": "backgroundUrl",
      "label": "backgroundUrl",
      "type": "string",
      "default": "Hello",
      "supporterLevel": 5
  }
]

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
            width: "600px",
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
  const databasePlayerSettings = {};//user?.plugin_settings?.[plugin?.id].player || {};
  const databaseGameSettings = user?.plugin_settings?.[plugin?.id].game || {};
  const databaseUiSettings = user?.plugin_settings?.[plugin?.id].ui || {};
  const gameDef = useGameDefinition();
  const gameDefPlayerProperties = gameDef?.playerProperties;
  const gameDefGameProperties = gameDef?.gameProperties;
  const siteL10n = useSiteL10n();
  const gameL10n = useGameL10n();
  const [currentUiSettings, setCurrentUiSettings] = useState({});
  const [currentUiSettingMode, setCurrentUiSettingsMode] = useState({});
  const [currentPlayerSettings, setCurrentPlayerSettings] = useState({});
  const [currentPlayerSettingMode, setCurrentPlayerSettingsMode] = useState({});
  const [currentGameSettings, setCurrentGameSettings] = useState({});
  const [currentGameSettingMode, setCurrentGameSettingsMode] = useState({});

  // Filter out keys in the game definition if their value (which is an object) does not have a showInSettings = true property
  const gameDefPlayerSettings = Object.keys(gameDefGameProperties).reduce((obj, key) => {
    if (gameDefGameProperties[key].showInSettings) {
      obj[key] = gameDefGameProperties[key];
    }
    return obj;
  }, {});

  const gameDefGameSettings = Object.keys(gameDefPlayerProperties).reduce((obj, key) => {
    if (gameDefPlayerProperties[key].showInSettings) {
      obj[key] = gameDefPlayerProperties[key];
    }
    return obj;
  }, {});

  // Get default values
  const defaultPlayerSettings = Object.keys(gameDefPlayerSettings).reduce((obj, key) => {
    obj[key] = gameDefPlayerSettings[key].default;
    return obj;
  }, {});

  const defaultGameSettings = Object.keys(gameDefGameSettings).reduce((obj, key) => {
    obj[key] = gameDefGameSettings[key].default;
    return obj;
  }, {});


  console.log("userSettings current",currentPlayerSettings);

  useEffect(() => {
    dispatch(setTyping(true));
    console.log("userSettings",{databasePlayerSettings, defaultPlayerSettings});
    setCurrentPlayerSettings({...defaultPlayerSettings}) //, ...databasePlayerSettings});
    // setCurrentGameSettings({...defaultGameSettings, ...databaseGameSettings});
    // // For each key that exists in the database settings, set the corresponding mode to "allGames"
    // setCurrentPlayerSettingsMode(Object.keys(databasePlayerSettings).reduce((obj, key) => {
    //   obj[key] = "allGames";
    //   return obj;
    // }
    // , {}));
    // setCurrentGameSettingsMode(Object.keys(databaseGameSettings).reduce((obj, key) => {
    //   obj[key] = "allGames";
    //   return obj;
    // }
    // , {}));
  }, [databasePlayerSettings]); //, databaseGameSettings, databaseUiSettings]);

  return (<div></div>)

  // const handleInputChange = (settingType, id, value) => {
  //   switch (settingType) {
  //     case "player":
  //       setCurrentPlayerSettings(prevSettings => ({
  //         ...prevSettings,
  //         [id]: value
  //       }));
  //       break;
  //     case "game":
  //       setCurrentGameSettings(prevSettings => ({
  //         ...prevSettings,
  //         [id]: value
  //       }));
  //       break;
  //     case "ui":
  //       setCurrentUiSettings(prevSettings => ({
  //         ...prevSettings,
  //         [id]: value
  //       }));
  //       break;
  //     default:
  //       break;
  //   }
  // };

  // const handleModeChange = (settingType, id, value) => {
  //   switch (settingType) {
  //     case "player":
  //       setCurrentPlayerSettingsMode(prevSettings => ({
  //         ...prevSettings,
  //         [id]: value
  //       }));
  //       break;
  //     case "game":
  //       setCurrentGameSettingsMode(prevSettings => ({
  //         ...prevSettings,
  //         [id]: value
  //       }));
  //       break;
  //     case "ui":
  //       setCurrentUiSettingsMode(prevSettings => ({
  //         ...prevSettings,
  //         [id]: value
  //       }));
  //       break;
  //     default:
  //       break;
  //   }
  // };

  // const handleSave = async () => {
  //   var url = currentPlayerSettings["background_url"];
  //   if (url && !(url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg"))) {
  //     alert(siteL10n("altArtFormatError"))
  //     return;
  //   }
  //   if (url === "") {
  //     url = null;
  //   }

  //   const thisGamePlayerSettings = {};
  //   const thisGameGameSettings = {};
  //   const permanentPlayerSettings = {};
  //   const permanentGameSettings = {};

  //   // Determine the values for this game (which will be pushed to backend) 
  //   // and all games (which will be pushed to backend and saved to user profile)
  //   for (const key of Object.keys(gameDefPlayerProperties)) {
  //     if (gameDefPlayerProperties[key].showInSettings) {
  //       thisGamePlayerSettings[key] = currentPlayerSettings[key];
  //       if (currentPlayerSettingMode[key] === "allGames") {
  //         permanentPlayerSettings[key] = currentPlayerSettings[key];
  //       }
  //     }
  //   }
  //   for (const key of Object.keys(gameDefGameProperties)) {
  //     if (gameDefGameProperties[key].showInSettings) {
  //       thisGameGameSettings[key] = currentGameSettings[key];
  //       if (currentGameSettingMode[key] === "allGames") {
  //         permanentGameSettings[key] = currentGameSettings[key];
  //       }
  //     }
  //   }

  //   // Update the database
  //   const newDatabasePluginSettings = {
  //     [plugin.id]: {
  //       player: permanentPlayerSettings,
  //       game: permanentGameSettings,
  //       ui: currentUiSettings,
  //     }
  //   };
    
  //   const res = await Axios.post("/be/api/v1/profile/update_plugin_user_settings", newDatabasePluginSettings, authOptions);

  //   const pluginSettings = user.plugin_settings;
  //   deepUpdate(pluginSettings, newDatabasePluginSettings);
  //   const newProfileData = {
  //     user_profile: {
  //       ...user,
  //       plugin_settings: pluginSettings
  //     }}

  //   user.setData(newProfileData);
  //   if (res.status !== 200) {
  //     alert(siteL10n("settingUpdateError")); 
  //   }

  //   // Update the game
  //   const actionList = [];
  //   for (const key of Object.keys(thisGamePlayerSettings)) {
  //     const label = gameDefPlayerProperties[key].label;
  //     const value = thisGamePlayerSettings[key];
  //     actionList.push(["SET", `/playerData/$PLAYER_N/${key}`, value]);
  //     actionList.push(["LOG", `{{$PLAYER_N}} set thier ${label} to ${value}.`]);
  //   }
  //   for (const key of Object.keys(thisGameGameSettings)) {
  //     const label = gameDefGameProperties[key].label;
  //     const value = thisGameGameSettings[key];
  //     actionList.push(["SET", `/${key}`, value]);
  //     actionList.push(["LOG", `{{$PLAYER_N}} set the ${label} to ${value}.`]);
  //   }

  //   doActionList(actionList);
  //   dispatch(setTyping(false));
  //   dispatch(setShowModal(null));
  // }

  // const renderModeElement = (settingType, propertyObj) => {
  //   return (
  //     <select
  //       className="p-2 w-32"
  //       value={currentPlayerSettingMode[propertyObj.id]}
  //       onChange={(e) => handleInputChange(settingType, propertyObj.id, e.target.value)}
  //     >
  //       <option key={"thisGame"} value={"thisGame"}>{siteL10n("thisGame")}</option>
  //       <option key={"allGames"} value={"allGames"}>{siteL10n("allGames")}</option>
  //     </select>
  //   );
  // };

  // const renderFormElement = (settingType, propertyObj) => {
  //   switch (propertyObj.type) {
  //     case 'integer':
  //       return (
  //         <input
  //           type="number"
  //           className="p-1 w-16"
  //           value={currentPlayerSettings[propertyObj.id]}
  //           onChange={(e) => handleInputChange(settingType, propertyObj.id, parseInt(e.target.value))}
  //         />
  //       );
  //     case 'string':
  //       return (
  //         propertyObj.supporterLevel > user?.supporter_level ?
  //           <button 
  //             className="flex items-center justify-center rounded text-white bg-gray-800 hover:bg-gray-700 p-1 px-4"
  //             onClick={() => {dispatch(setShowModal("patreon"))}}
  //             >
  //             <span>Unlock</span>
  //             <img className="ml-2" style={{height: "20px"}} src="https://upload.wikimedia.org/wikipedia/commons/9/94/Patreon_logo.svg" alt="Patreon logo"/>
  //           </button>
  //           :
  //           <input
  //             disabled={propertyObj.supporterLevel > user?.supporter_level}
  //             type="text"
  //             className="p-1 w-32"
  //             value={currentPlayerSettings[propertyObj.id]}
  //             onChange={(e) => handleInputChange(settingType, propertyObj.id, e.target.value)}
  //           />
  //       );
  //     case 'option':
  //       return (
  //         <select
  //           className="p-2 w-32"
  //           value={currentPlayerSettings[propertyObj.id]}
  //           onChange={(e) => handleInputChange(settingType, propertyObj.id, e.target.value)}
  //         >
  //           {propertyObj.options.map(option => (
  //             <option key={option.id} value={option.id}>{siteL10n(option.label)}</option>
  //           ))}
  //         </select>
  //       );
  //     case 'checkbox':
  //       return (
  //         <input
  //           type="checkbox"
  //           className="p-1"
  //           checked={currentPlayerSettings[propertyObj.id]}
  //           onChange={(e) => handleInputChange(settingType, propertyObj.id, e.target.checked)}
  //         />
  //       );
  //     default:
  //       return null;
  //   }
  // };

  // return(
  //   <div className="text-white">
  //     <h1 className="mb-2">{siteL10n("uiPreferences")}</h1>
  //     <table className="w-full mb-2">
  //       <tbody>
  //         {uiSettings.map((propertyObj, index) => (
  //           <tr key={propertyObj.id} className={index % 2 === 0 ? "bg-gray-600" : "bg-gray-700"}>
  //             <td className="px-4 py-2">{siteL10n(propertyObj.label)}</td>
  //             <td className="px-4 py-2 text-black">{renderFormElement("ui", propertyObj)}</td>
  //           </tr>
  //         ))}
  //       </tbody>
  //     </table>
  //     <h1 className="mb-2">{siteL10n("playerPreferences")}</h1>
  //     <table className="w-full mb-2">
  //       <tbody>
  //         {Object.keys(gameDefPlayerSettings).map((propertyId, index) => {
  //           const propertyObj = gameDefPlayerSettings[propertyId];
  //           if (!propertyObj.showInSettings) return null;
  //           else return (
  //             <tr key={propertyId} className={index % 2 === 0 ? "bg-gray-600" : "bg-gray-700"}>
  //               <td className="px-4 py-2">{gameL10n(propertyObj.label)}</td>
  //               <td className="px-4 py-2 text-black">{renderFormElement("player", propertyObj)}</td>
  //               <td className="px-4 py-2 text-black">{renderModeElement("player", propertyObj)}</td>
  //             </tr>
  //           )
  //         })}
  //       </tbody>
  //     </table>
  //     <h1 className="mb-2">{siteL10n("gamePreferences")}</h1>
  //     <table className="w-full mb-2">
  //       <tbody>
  //         {Object.keys(gameDefGameSettings).map((propertyId, index) => {
  //           const propertyObj = gameDefGameSettings[propertyId];
  //           if (!propertyObj.showInSettings) return null;
  //           else return (
  //             <tr key={propertyId} className={index % 2 === 0 ? "bg-gray-600" : "bg-gray-700"}>
  //               <td className="px-4 py-2">{gameL10n(propertyObj.label)}</td>
  //               <td className="px-4 py-2 text-black">{renderFormElement("game", propertyObj)}</td>
  //               <td className="px-4 py-2 text-black">{renderModeElement("game", propertyObj)}</td>
  //             </tr>
  //           )
  //         })}
  //       </tbody>
  //     </table>
  //     <div className="flex items-center justify-between">
  //       <Button isSubmit isPrimary className="my-2 w-64" onClick={handleSave}>
  //         Update
  //       </Button>
  //     </div>
  //   </div>
  // );
}
