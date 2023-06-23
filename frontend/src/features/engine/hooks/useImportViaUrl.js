import { useGameDefinition } from "./useGameDefinition";
import { usePlayerN } from "./usePlayerN";
import { useImportLoadList } from "./useImportLoadList";
import { useDoActionList } from "./useDoActionList";

export const useImportViaUrl = () => {
  const playerN = usePlayerN();
  const importLoadList = useImportLoadList();
  const gameDef = useGameDefinition();
  const doActionList = useDoActionList();
  return async () => {
    if (gameDef["pluginName"] === "LotR Living Card Game") {
      await importViaUrlRingsDb(importLoadList, doActionList, playerN);
    } else {
      alert("Importing via URL is not yet supported for this game. Please request this feature on Discord.");
    }
  }
}

const importViaUrlRingsDb = async (importLoadList, doActionList, playerN) => {
    const ringsDbUrl = prompt("Paste full RingsDB URL","");
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
  doActionList(["LOG", "$PLAYER_N", " is importing a deck from RingsDB."]);
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
            loadList.push({'uuid': slotJsonData.octgnid, 'quantity': quantity, 'loadGroupId': loadGroupId});
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
            loadList.push({'uuid': slotJsonData.octgnid, 'quantity': quantity, 'loadGroupId': loadGroupId});
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
      importLoadList(loadList);
    });
  })
  .catch((error) => {
    // handle your errors here
    alert("Error loading deck. If you are attempting to load an unpublished deck, make sure you have link sharing turned on in your RingsDB profile settings.")
  })
}