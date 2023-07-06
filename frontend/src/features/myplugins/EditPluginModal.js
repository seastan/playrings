import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import ReactModal from "react-modal";
import Button from "../../components/basic/Button";
import { useSiteL10n } from "../../hooks/useSiteL10n";
import useForm from "../../hooks/useForm";
import useAuth from "../../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { mergeJSONs, processArrayOfRows, readFileAsText, stringTo2DArray } from "./uploadPluginFunctions";
import { validateSchema } from "./validate/validateGameDef";
import { getGameDefSchema } from "./validate/getGameDefSchema";
import useProfile from "../../hooks/useProfile";

ReactModal.setAppElement("#root");


export const EditPluginModal = ({ plugin, closeModal, doFetchHash}) => {
  console.log("Rendering EditPluginModal", plugin)
  const user = useProfile();
  const { authToken, renewToken, setAuthAndRenewToken } = useAuth();
  const authOptions = useMemo(
    () => ({
      headers: {
        Authorization: authToken,
      },
    }),
    [authToken]
  );
  const [checked, setChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");

  const [validGameDef, setValidGameDef] = useState(false);
  const [validCardDb, setValidCardDb] = useState(false);
  const [errorMessagesGameDef, setErrorMessagesGameDef] = useState([]);
  const [errorMessageCardDb, setErrorMessageCardDb] = useState("");

  const [successMessageGameDef, setSuccessMessageGameDef] = useState("");
  const [successMessageCardDb, setSuccessMessageCardDb] = useState("");
  const siteL10n = useSiteL10n();

  const inputFileGameDef = useRef(null);
  const inputFileCardDb = useRef(null);

  const { inputs, handleSubmit, handleInputChange, setInputs } = useForm(async () => {
    console.log("inputs", inputs);
    if (inputs.gameDef && (!inputs.gameDef.pluginName || inputs.gameDef.pluginName.length == 0)) {
      setErrorMessage("Invalid plugin name");
      return;
    }
    setSuccessMessage("");
    setErrorMessage("");
    setLoadingMessage("Please wait...");

    var res;

    if (plugin === null) {

      const updateData = {
        plugin: {
          name: inputs.gameDef.pluginName,
          author_id: user?.id,
          game_def: inputs.gameDef,
          card_db: inputs.cardDb,
          public: inputs.public || false,
        }
      }
      res = await axios.post("/be/api/myplugins", updateData, authOptions);

    } else {

      const updateData = {
        plugin: {
          id: plugin.id,
          game_def: inputs.gameDef,
          card_db: inputs.cardDb,
          public: inputs.public || false,
        }
      };
      res = await axios.patch("/be/api/myplugins/"+plugin.id, updateData, authOptions);
    }

    if (
      res.status === 200
    ) {
      doFetchHash();
      setSuccessMessage("Plugin updated.");
      setErrorMessage("");
      setLoadingMessage("");
      closeModal();
    } else {
      setSuccessMessage("");
      setErrorMessage("Error."); 
      setLoadingMessage("");
    }
  });

  useEffect(() => {
    if (inputs && plugin && inputs.public !== plugin.public) setInputs({...inputs, public: plugin.public});
  },[])

  const uploadGameDefJson = async(event) => {
    event.preventDefault();
    const files = event.target.files;
    let readers = [];
  
    // Abort if there were no files selected
    if(!files.length) return;
  
    // Store promises in array
    for(let i = 0; i < files.length; i++){
        readers.push(readFileAsText(files[i]));
    }
    
    // Trigger Promises
    Promise.all(readers).then((jsonList) => {
      console.log("unmerged",jsonList);
      var mergedJSONs;
      try {
        mergedJSONs = mergeJSONs(jsonList);
        console.log("mergedJSONs", mergedJSONs)
        const errors = []
        validateSchema(mergedJSONs, "gameDef", mergedJSONs, getGameDefSchema(mergedJSONs), errors);
        if (errors.length === 0) {
          setSuccessMessageGameDef(`Game definition uploaded successfully: ${mergedJSONs.pluginName}`);
          setErrorMessagesGameDef([]);
          setValidGameDef(true);
          setInputs({...inputs, gameDef: mergedJSONs});
        } else {
          // Set the error message
          const labelSchema = "";
          
          setErrorMessagesGameDef(errors)
          setValidGameDef(false);
        }
      } catch (error) {
        setErrorMessagesGameDef(["Invalid JSON file(s)"]);
      }
    });

    inputFileGameDef.current.value = "";
  }

  const uploadCardDbTsv = async(event) => {
    event.preventDefault();
    const files = event.target.files;
    let readers = [];
  
    // Abort if there were no files selected
    if(!files.length) return;
  
    // Store promises in array
    for(let i = 0; i < files.length; i++){
        readers.push(readFileAsText(files[i]));
    }
    
    // Trigger Promises
    Promise.all(readers).then((tsvList) => {
      console.log("unmerged",tsvList);
      const arrayOfRows = []; // Each element is a 2D array representing a tsv file
      for (var tsvString of tsvList) { 
        console.log("tsvString", tsvString)
        try {
          const rows = stringTo2DArray(tsvString);
          console.log("tsvString rows", rows)
          arrayOfRows.push(rows)
        } catch(err) {
          console.log("err",err)
          var message = "Error";
          if (err.message.includes("data does not include separator")) message += ": Invalid file format. Make sure the data is tab-separated."
          setErrorMessageCardDb(message);
          return;
        }
      }
      try {
        const cardDb = processArrayOfRows(inputs, plugin, arrayOfRows);
        setSuccessMessageCardDb(`Card database uploaded successfully: ${Object.keys(cardDb).length} cards.`);
        setErrorMessageCardDb("");
        setValidCardDb(true);
        setInputs({...inputs, cardDb: cardDb});
      } catch(err) {
        setErrorMessageCardDb("Error: "+err.message);
      }
    });
    inputFileGameDef.current.value = "";
  }

  const loadFileGameDef = () => {
    inputFileGameDef.current.click();
  }
  const loadFileCardDb = () => {
    inputFileCardDb.current.click();
  }

  const downloadGameDefJson = () => {
    const exportName = inputs.gameDef.pluginName.replaceAll(" ", "-");
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inputs.gameDef));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  const changesMade = plugin ? ((inputs.public !== plugin.public) || inputs.gameDef || inputs.cardDb) : (inputs.gameDef || inputs.cardDb);
  
  return (
    <ReactModal
      closeTimeoutMS={200}
      isOpen={true}
      onRequestClose={closeModal}
      contentLabel="New Plugin"
      overlayClassName="fixed inset-0 bg-black-50 z-50 overflow-y-scroll"
      className="insert-auto p-5 bg-gray-700 border mx-auto my-12 rounded-lg outline-none"
      style={{
        overlay: {
        },
        content: {
          width: '500px',
        }
      }}
    >
      
      <h1 className="">{plugin ? siteL10n("Edit") : siteL10n("New")} {siteL10n(" Plugin")}</h1>
      <div className="text-white text-sm">{plugin?.name}</div>

      <form action="POST" onSubmit={handleSubmit}>
        <fieldset>{/* 
            <label className="block text-sm font-bold mb-2 mt-4">
              Game Name
            </label>
            <input
              name="plugin_name"
              className="form-control w-full mb-2"
              onChange={handleInputChange}
              value={inputs.plugin_name || ""}
            /> */}
          <label className="block text-sm font-bold mb-2 mt-4 text-white">
            {siteL10n("Game definition (.json)")}
          </label>
          <label className="block text-xs mb-2 text-white">
            {siteL10n("You may upload multiple jsons at once that define different aspects of the game and they will be merged automatically.")}
          </label>
          <Button onClick={() => loadFileGameDef()}>
            {siteL10n("Load game definition (.json)")}
            <input type='file' multiple id='file' ref={inputFileGameDef} style={{display: 'none'}} onChange={uploadGameDefJson} accept=".json"/>
          </Button>
          {successMessageGameDef && (
            <div className="alert alert-info mt-1 text-xs p-1 pl-3">{successMessageGameDef}</div>
          )}
          {errorMessagesGameDef.length > 0 && (
            errorMessagesGameDef.map((message, i) => (
              <div index={i} className="alert alert-danger mt-1 text-xs p-1 pl-3">{message}</div>
            ))
          )}
          <label className="block text-sm font-bold mb-2 mt-4 text-white">
          {siteL10n("Card database (.tsv)")}
          </label>
          <label className="block text-xs mb-2 text-white">
            {siteL10n("You may upload multiple tab-separated-value (.tsv) files at once that define different cards and they will be merged automatically. Eech file must share the same header information. A valid game definition must be uploaded first.")}
          </label>
          <Button disabled={!validGameDef} onClick={() => loadFileCardDb()}>
            {plugin ? siteL10n("(Optional) Update card database (.tsv)") : siteL10n("Upload card database (.tsv)")}
            <input type='file' multiple id='file' ref={inputFileCardDb} style={{display: 'none'}} onChange={uploadCardDbTsv} accept=".tsv"/>
          </Button>
          {successMessageCardDb && (
            <div className="alert alert-info mt-1 text-xs p-1 pl-3">{successMessageCardDb}</div>
          )}
          {errorMessageCardDb && (
            <div className="alert alert-danger mt-1 text-xs p-1 pl-3">{errorMessageCardDb}</div>
          )}
          <label className="block text-sm font-bold mb-2 mt-4 text-white">
          {siteL10n("Visibility")}
          </label>
          <div className="w-full">
            <div className="p-1 float-left w-1/2">
          <Button isPrimary={inputs.public} onClick={() => setInputs({...inputs, public: true})}>
            {inputs.public && <FontAwesomeIcon className="" icon={faCheck}/>} {siteL10n("Public")}
          </Button>
          </div>
          <div className="p-1 float-left w-1/2">
          <Button isPrimary={!inputs.public}  onClick={() => setInputs({...inputs, public: false})}>
            {!inputs.public && <FontAwesomeIcon className="" icon={faCheck}/>} {siteL10n("Private")}
          </Button>
          </div>
          </div> 
          <Button disabled={!changesMade || !validCardDb || !validGameDef} isSubmit={changesMade} className="mt-4">
          {plugin ? siteL10n("Update Plugin") : siteL10n("Create Plugin")}
          </Button>
          {changesMade && <div className="alert alert-info mt-4">{siteL10n("You have unsaved changes.")}</div>}
          {successMessage && (
            <div className="alert alert-info mt-4">{successMessage}</div>
          )}
          {errorMessage && (
            <div className="alert alert-danger mt-4">{errorMessage}</div>
          )}
          {loadingMessage && (
            <div className="alert alert-info mt-4">{loadingMessage}</div>
          )}
        </fieldset>
      </form>
{/*       <Button onClick={(event) => {uploadGameDefJson(event)}} isPrimary className="mx-2 mt-2">Upload</Button>
 */}
    </ReactModal>
  );
};
export default EditPluginModal;
