import React, { useEffect, useMemo, useRef, useState } from "react";
import { Redirect } from "react-router";
import Select from 'react-select'
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import ReactModal from "react-modal";
import Button from "../../components/basic/Button";
import useProfile from "../../hooks/useProfile";
import useIsLoggedIn from "../../hooks/useIsLoggedIn";
import { Link } from "react-router-dom";
import { useSiteL10n } from "../../hooks/useSiteL10n";
import { isObject } from "../store/updateValues";
import useForm from "../../hooks/useForm";
import useAuth from "../../hooks/useAuth";
import { setShowModal } from "../store/playerUiSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { checkValidGameDef, mergeJSONs, readFileAsText } from "./PluginFileImport";
const { convertCSVToArray } = require('convert-csv-to-array');
const converter = require('convert-csv-to-array');

ReactModal.setAppElement("#root");

const stringTo2DArray = (inputString) => {
  // Split the input string into tokens using the tab character
  const tokens = inputString.split('\t');

  // Determine the number of columns based on the number of tabs in the header row
  const numColumns = inputString.split('\n')[0].split('\t').length;

  // Initialize an empty 2D array and the current row array
  const array2D = [];
  let currentRow = [];

  // Iterate through each token
  for (let token of tokens) {
    // Split the token into values based on newline characters
    const values = token.split('\n');

    // Add the first value to the current row
    currentRow.push(values[0]);

    // If there are more values, it means there's a new row
    for (let i = 1; i < values.length; i++) {
      // Add the current row to the 2D array if it has the correct number of columns
      if (currentRow.length === numColumns) {
        array2D.push(currentRow);
      }

      // Start a new row with the current value
      currentRow = [values[i]];
    }
  }

  // Add the last row to the 2D array if it has the correct number of columns
  if (currentRow.length === numColumns) {
    array2D.push(currentRow);
  }

  return array2D;
}

export const EditPluginModal = ({ plugin, isOpen, closeModal }) => {
  console.log("Rendering EditPluginModal", plugin)
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
  const [errorMessageGameDef, setErrorMessageGameDef] = useState("");
  const [errorMessageCardDb, setErrorMessageCardDb] = useState("");

  const [successMessageGameDef, setSuccessMessageGameDef] = useState("");
  const [successMessageCardDb, setSuccessMessageCardDb] = useState("");
  const l10n = useSiteL10n();

  const inputFileGameDef = useRef(null);
  const inputFileCardDb = useRef(null);

  const { inputs, handleSubmit, handleInputChange, setInputs } = useForm(async () => {
    console.log("inputs", inputs);
    if (inputs.gameDef && (!inputs.gameDef.pluginName || inputs.gameDef.pluginName.length == 0)) {
      setErrorMessage("Invalid plugin name");
      return;
    }
/*     if (!inputs.gameDef) {
      setErrorMessage("No game definition specified.");
      return;
    }
    if (!inputs.cardDb) {
      setErrorMessage("No card database specified.");
      return;
    } */
    const updateData = {
      plugin: {
        id: plugin.id,
        game_def: inputs.gameDef,
        card_db: inputs.cardDb,
        public: inputs.public || false,
      },
    };
    //const res = await axios.post("/be/api/v1/profile/update", data);

    setSuccessMessage("");
    setErrorMessage("");
    setLoadingMessage("Please wait...");
    const res = await axios.patch("/be/api/myplugins/"+plugin.id, updateData, authOptions);
    if (
      res.status === 200
    ) {
      setSuccessMessage("Plugin created.");
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
    if (inputs && inputs.public !== plugin.public) setInputs({...inputs, public: plugin.public});
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
        const isValid = checkValidGameDef(mergedJSONs);
        if (isValid === true) {
          setSuccessMessageGameDef(`Game definition uploaded successfully: ${mergedJSONs.pluginName}`);
          setErrorMessageGameDef("");
          setValidGameDef(true);
          setInputs({...inputs, gameDef: mergedJSONs});
        } else {
          setErrorMessageGameDef(`Error: ${isValid}`)
        }
      } catch (error) {
        setErrorMessageGameDef("Invalid JSON file(s)");
      }
    });

    inputFileGameDef.current.value = "";
  }


  const processArrayOfRows = (arrayOfRows) => {
    console.log(arrayOfRows, "arrayOfRows");
    const gameDef = plugin.gameDef || inputs.gameDef;
    const header0 = arrayOfRows[0][0];
    if (!header0.includes("uuid")) throw new Error("Missing uuid column.")
    if (!header0.includes("name")) throw new Error("Missing name column.")
    if (!header0.includes("imageUrl")) throw new Error("Missing imageUrl column.")
    if (!header0.includes("cardBack")) throw new Error("Missing cardBack column.")
    const header0Str = JSON.stringify(header0);
    const cardDb = {};
    for (var rows of arrayOfRows) {
      const headerStr = JSON.stringify(rows[0]);
      if (headerStr !== header0Str) throw new Error("File headers do not match.")
      for (var i=1; i<rows.length; i++) {
        const row = rows[i];
        const faceA = {};
        for (var j=0; j<header0.length; j++) {
          const colName = header0[j];
          faceA[colName] = colName === "automation" && row[j] ? JSON.parse(row[j]) : row[j];
        }
        console.log("dbrow 1", row)
        var faceB = {};
        if (faceA.cardBack === "double_sided") {
          for (var j=0; j<header0.length; j++) {
            faceB[header0[j]] = rows[i+1][j];
          }
          i += 1;
        } else {
          for (var key of header0) {
            faceB[key] = null;
          }
          faceB["name"] = faceA.cardBack;
          if (!gameDef?.cardBacks || !Object.keys(gameDef.cardBacks).includes(faceB["name"])) throw new Error(`cardBack for ${faceA.name} not found in gameDef.cardBacks`)
        }
        cardDb[faceA.uuid] = {
          "A": faceA,
          "B": faceB
        }
      }
    }
    console.log("database", cardDb)
    return cardDb;
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
        const cardDb = processArrayOfRows(arrayOfRows);
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

  const changesMade = (inputs.public !== plugin.public) || inputs.gameDef || inputs.cardDb;
  
  return (
    <ReactModal
      closeTimeoutMS={200}
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="New Plugin"
      overlayClassName="fixed inset-0 bg-black-50 z-50"
      className="insert-auto p-5 bg-gray-700 border mx-auto my-12 rounded-lg outline-none"
      style={{
        overlay: {
        },
        content: {
          width: '500px',
        }
      }}
    >
      
      <h1 className="mb-2">Edit Plugin</h1>
      <h2 className="mb-2">{plugin?.plugin_name}</h2>

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
            Game definition (.json)
          </label>
          <label className="block text-xs mb-2 text-white">
            You may upload multiple jsons at once that define different aspects of the game and they will be merged automatically.
          </label>
          <Button onClick={() => loadFileGameDef()}>
            {l10n("Replace game definition (.json)")}
            <input type='file' multiple id='file' ref={inputFileGameDef} style={{display: 'none'}} onChange={uploadGameDefJson} accept=".json"/>
          </Button>
          {successMessageGameDef && (
            <div className="alert alert-info mt-4">{successMessageGameDef}</div>
          )}
          {errorMessageGameDef && (
            <div className="alert alert-danger mt-4">{errorMessageGameDef}</div>
          )}
          <label className="block text-sm font-bold mb-2 mt-4 text-white">
            Card database (.tsv)
          </label>
          <label className="block text-xs mb-2 text-white">
            You may upload multiple tab-separated-value (.tsv) files at once that define different cards and they will be merged automatically. Eech file must share the same header information. A valid game definition must be uploaded first.
          </label>
          <Button onClick={() => loadFileCardDb()}>
            {l10n("Replace card database (.tsv)")}
            <input type='file' multiple id='file' ref={inputFileCardDb} style={{display: 'none'}} onChange={uploadCardDbTsv} accept=".tsv"/>
          </Button>
          {successMessageCardDb && (
            <div className="alert alert-info mt-4">{successMessageCardDb}</div>
          )}
          {errorMessageCardDb && (
            <div className="alert alert-danger mt-4">{errorMessageCardDb}</div>
          )}
          <label className="block text-sm font-bold mb-2 mt-4 text-white">
            Visibility
          </label>
          <div className="w-full">
            <div className="p-1 float-left w-1/2">
          <Button isPrimary={inputs.public} onClick={() => setInputs({...inputs, public: true})}>
            {inputs.public && <FontAwesomeIcon className="" icon={faCheck}/>} Public
          </Button>
          </div>
          <div className="p-1 float-left w-1/2">
          <Button isPrimary={!inputs.public}  onClick={() => setInputs({...inputs, public: false})}>
            {!inputs.public && <FontAwesomeIcon className="" icon={faCheck}/>} Private
          </Button>
          </div>
          </div> 
          <Button disabled={!changesMade} isSubmit={changesMade} className="mt-4">
            Update Plugin
          </Button>
          {changesMade && <div className="alert alert-info mt-4">You have unsaved changes.</div>}
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
