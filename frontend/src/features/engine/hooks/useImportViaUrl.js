import { useGameDefinition } from "./useGameDefinition";
import { usePlayerN } from "./usePlayerN";
import { useImportLoadList } from "./useImportLoadList";
import { useDoActionList } from "./useDoActionList";
import { el } from "date-fns/locale";
import { useCardDb } from "./useCardDb";

export const useImportViaUrl = () => {
  const playerN = usePlayerN();
  const importLoadList = useImportLoadList();
  const gameDef = useGameDefinition();
  const doActionList = useDoActionList();
  const cardDb = useCardDb();
  return async () => {
    if (gameDef["pluginName"] === "LotR Living Card Game") {
      await importViaUrlRingsDb(importLoadList, doActionList, playerN);
    } else if (gameDef["pluginName"] === "Marvel Champions: The Card Game") {
      await importViaUrlMarvelCdb(importLoadList, doActionList, playerN, cardDb);
    } else {
      alert("Importing via URL is not yet supported for this game. Please request this feature on Discord.");
    }
  }
}

const importViaUrlRingsDb = async (importLoadList, doActionList, playerN) => {
    const ringsDbUrl = prompt("Paste full RingsDB URL","");
    if (!ringsDbUrl.includes("ringsdb.com")) {
      alert("Only importing from MarvelCDB is supported at this time.");
      return;
    }
    if (ringsDbUrl.includes("/fellowship/")) {
      alert("Fellowship import not yet supported.");
      return;
    }
    const ringsDbDomain = ringsDbUrl.includes("test.ringsdb.com") ? "test" : "ringsdb";
    var ringsDbType;
    if (ringsDbUrl.includes("/decklist/")) ringsDbType = "decklist";
    else if (ringsDbUrl.includes("/deck/")) ringsDbType = "deck";
    if (!ringsDbType) {
      alert("Invalid URL");
      return;
    }
    var splitUrl = ringsDbUrl.split( '/' );
    const typeIndex = splitUrl.findIndex((e) => e === ringsDbType)
    if (splitUrl && splitUrl.length <= typeIndex + 2) {
      alert("Invalid URL");
      return;
    }
    const ringsDbId = splitUrl[typeIndex + 2];
    return loadRingsDb(importLoadList, doActionList, playerN, ringsDbDomain, ringsDbType, ringsDbId);
}


export const loadRingsDb = (importLoadList, doActionList, playerN, ringsDbDomain, ringsDbType, ringsDbId) => {
  doActionList(["LOG", "$ALIAS_N", " is importing a deck from RingsDB."]);
  const urlBase = ringsDbDomain === "test" ? "https://www.test.ringsdb.com/api/" : "https://www.ringsdb.com/api/"
  const url = ringsDbType === "decklist" ? urlBase+"public/decklist/"+ringsDbId+".json" : urlBase+"oauth2/deck/load/"+ringsDbId;
  console.log("Fetching ", url);
  fetch(url)
  .then(response => response.json())
  .then((jsonData) => {
    // jsonData is parsed json object received from url
    const slots = jsonData.slots;
    const sideslots = jsonData.sideslots;
    var loadList = [];
    var fetches = [];
    Object.keys(slots).forEach((slot, slotIndex) => {
      const quantity = slots[slot];
      const slotUrl = urlBase+"public/card/"+slot+".json"
      fetches.push(fetch(slotUrl)
        .then(response => response.json())
        .then((slotJsonData) => {
          // jsonData is parsed json object received from url
          console.log("ringsdbimport", slotJsonData.name, slotJsonData)
          if (slotJsonData.name.includes("MotK")) {
            alert("You will need to search your deck for your MotK hero.")
          } else if (slotJsonData.octgnid) {
            const type = slotJsonData.type_name;
            var loadGroupId = (type === "Hero" || type === "Contract") ? playerN+"Play1" : playerN+"Deck";
            if (slotJsonData.text.includes("Encounter")) loadGroupId = playerN+"Sideboard";
            console.log("ringsdbimport", slotJsonData.name, slotJsonData)
            loadList.push({'databaseId': slotJsonData.octgnid, 'quantity': quantity, 'loadGroupId': loadGroupId});
          } else {
            alert("Encountered unknown card ID for "+slotJsonData.name)
          }
        })
        .catch((error) => {
          // handle your errors here
          console.error("Could not find card", slot);
        })
      )
    })
    Object.keys(sideslots).forEach((slot, slotIndex) => {
      const quantity = sideslots[slot];
      const slotUrl = urlBase+"public/card/"+slot+".json"
      fetches.push(fetch(slotUrl)
        .then(response => response.json())
        .then((slotJsonData) => {
          // jsonData is parsed json object received from url
          if (slotJsonData.octgnid) {
            const loadGroupId = playerN+"Sideboard";
            loadList.push({'databaseId': slotJsonData.octgnid, 'quantity': quantity, 'loadGroupId': loadGroupId});
          } else {
            alert("Encountered unknown card ID for "+slotJsonData.name)
          }
        })
        .catch((error) => {
          // handle your errors here
          console.error("Could not find card", slot);
        })
      )
    })
    Promise.all(fetches).then(function() {
      console.log("loadList 1", loadList)
      importLoadList(loadList);
    });
  })
  .catch((error) => {
    // handle your errors here
    alert("Error loading deck. If you are attempting to load an unpublished deck, make sure you have link sharing turned on in your RingsDB profile settings.")
  })
}



const importViaUrlMarvelCdb = async (importLoadList, doActionList, playerN, cardDb) => {
  const dbUrl = prompt("Paste full MarvelCDB URL","");
  if (!dbUrl.includes("marvelcdb.com")) {
    alert("Only importing from MarvelCDB is supported at this time.");
    return;
  }
  const dbDomain = "marvelcdb";
  var dbType;
  if (dbUrl.includes("/decklist/")) dbType = "decklist";
  else if (dbUrl.includes("/deck/")) dbType = "deck";
  if (!dbType) {
    alert("Invalid URL");
    return;
  }
  var splitUrl = dbUrl.split( '/' );
  const typeIndex = splitUrl.findIndex((e) => e === dbType)
  if (splitUrl && splitUrl.length <= typeIndex + 2) {
    alert("Invalid URL");
    return;
  }
  const dbId = splitUrl[typeIndex + 2];
  return loadMarvelCdb(importLoadList, doActionList, playerN, dbDomain, dbType, dbId, cardDb);
}


export const loadMarvelCdb = (importLoadList, doActionList, playerN, dbDomain, dbType, dbId, cardDb) => {
  doActionList(["LOG", "$ALIAS_N", " is importing a deck from MarvelCDB."]);

  // Generate a mapping from marcelcdbId to databaseId
  const marvelcdbIdTodatabaseId = {};
  Object.keys(cardDb).forEach((databaseId, _databaseIdIndex) => {
    const cardDetails = cardDb[databaseId];
    for (var [side, details] of Object.entries(cardDetails)) {
      if (details.marvelcdbId) {
        marvelcdbIdTodatabaseId[details.marvelcdbId] = databaseId;
      }
    }
  })

  console.log("marvelcdbIdTodatabaseId", marvelcdbIdTodatabaseId)

  const urlBase = "https://marvelcdb.com/api";
  const url = `${urlBase}/public/${dbType}/${dbId}.json`;// dbType === "decklist" ? urlBase+"public/decklist/"+dbId+".json" : urlBase+"oauth2/deck/load/"+dbId;
  console.log("Fetching ", url);
  
  fetch(url)
  .then(response => response.json())
  .then((jsonData) => {
    console.log("card db import response", jsonData)
    const itentityCode = jsonData.investigator_code;
    const slots = jsonData.slots;
    var loadList = [];
    if (itentityCode && marvelcdbIdTodatabaseId[itentityCode]) {
      const databaseId = marvelcdbIdTodatabaseId[itentityCode];
      loadList.push({'databaseId': databaseId, 'quantity': 1, 'loadGroupId': playerN+"Play1"});
    } else {
      alert("Encountered missing or unknown card ID for identity")
    }
    var fetches = [];
    Object.keys(slots).forEach((slot, slotIndex) => {
      console.log("card db import", slot, slots[slot])
      const quantity = slots[slot];
      const slotUrl = urlBase+"/public/card/"+slot+".json"
      fetches.push(fetch(slotUrl)
        .then(response => response.json())
        .then((slotJsonData) => {
          console.log("card db import", slotJsonData.name, slotJsonData)
          // If slotJsonData.code is in the marvelcdbIdTodatabaseId mapping, use that databaseId
          if (slotJsonData.code && marvelcdbIdTodatabaseId[slotJsonData.code]) {
            const databaseId = marvelcdbIdTodatabaseId[slotJsonData.code];
            // We could add some code here if we want to handle certain car types differently
            loadList.push({'databaseId': databaseId, 'quantity': quantity, 'loadGroupId': playerN+"Deck"});
          } else {
            alert(`Encountered unknown card ID (${slotJsonData.code}) for ${slotJsonData.name}`)
          }
        })
        .catch((error) => {
          // handle your errors here
          console.error("Could not find card", slot);
        })
      )
    })
    Promise.all(fetches).then(function() {
      console.log("card db import loadList", loadList)
      importLoadList(loadList);
    });
  })
  .catch((error) => {
    // handle your errors here
    alert("Error loading deck. If you are attempting to load an unpublished deck, make sure you have link sharing turned on in your RingsDB profile settings.")
  })
}