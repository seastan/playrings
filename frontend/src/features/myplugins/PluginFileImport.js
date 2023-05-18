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
  console.log("dropmenucard 2", obj1, obj2)
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

/* const csvToJson = (csv) => {
  const json0 = JSON.parse(jsonList[0]);
  for (var i = 1; i < jsonList.length; i++) {
    deepMerge(json0, JSON.parse(jsonList[i]));
  }
  return json0;
} */

export const checkValidGameDef = (gameDef) => {
  // Needs to be a non-empty string
  const pluginName = gameDef?.pluginName;
  if (pluginName && (typeof pluginName === 'string' || pluginName instanceof String) && pluginName.length > 0) {
    return true;
  } else {
    return "Invalid or missing pluginName value."
  }
}
