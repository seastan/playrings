import { validateSchema } from "./validate/validateGameDef";
import { isObject } from "../store/updateValues";


export const readFileAsText = (file) => {
  return new Promise(function(resolve,reject){
    let fr = new FileReader();

    fr.onload = function(){
        resolve(fr.result);
    };

    fr.onerror = function(){
        reject(fr);
    };

    fr.readAsText(file);
  });
}


export const deepMerge = (obj1, obj2) => {
// If they are already equal, we are done
if (obj1 === obj2) return;
// If obj1 does not exist, set it to obj2
if (!obj1) {
  obj1 = obj2;
  return;
}
// The we loop through obj2 properties and update obj1
for (var p in obj2) {
  // Ignore prototypes
  if (!obj2.hasOwnProperty(p)) continue;
  // If property does not exists in obj1, add it to obj1
  if (!obj1.hasOwnProperty(p)) {
    obj1[p] = obj2[p];
    continue;
  }
  // Both objects have the property
  // If they have the same strict value or identity then no need to update
  if (obj1[p] === obj2[p]) continue;
  // Objects are not equal. We need to examine their data type to decide what to do
  if (Array.isArray(obj1[p]) && Array.isArray(obj2[p])) {
    // Both values are arrays. Concatenate them.
    obj1[p] = obj1[p].concat(obj2[p]);
  } else if (isObject(obj1[p]) && isObject(obj2[p])) {
    // Both values are objects
    deepMerge(obj1[p], obj2[p]);
  }
}
} 

export const mergeJSONs = (jsonList) => {
const json0 = JSON.parse(jsonList[0]);
for (var i = 1; i < jsonList.length; i++) {
  deepMerge(json0, JSON.parse(jsonList[i]));
}
return json0;
}



export const stringTo2DArray = (inputString) => {
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


export const processArrayOfRows = (inputs, plugin, arrayOfRows) => {

    const gameDef = plugin?.gameDef || inputs.gameDef;
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
                const colName = header0[j].replace(/\r$/, '');
                faceA[colName] = row[j].replace(/\r$/, '');
            }
            var faceB = {};
            if (faceA.cardBack === "double_sided") {
                for (var j=0; j<header0.length; j++) {
                    const colName = header0[j].replace(/\r$/, '');
                    faceB[colName] = rows[i+1][j].replace(/\r$/, '');
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
    return cardDb;
}
