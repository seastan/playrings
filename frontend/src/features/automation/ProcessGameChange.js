import { stringify } from "querystring";
import { flatListOfCards } from "../room/Helpers";

// cl refers to a flattened list of all card objects


const isObject = (item) => {
    return (typeof item === "object" && !Array.isArray(item) && item !== null);
  }

function byProperty(property, value) {
    return function(card) {
        if (card[property] === value) return true;
        if (typeof card[property] === "string" && card[property].includes(value)) return true;
        return false;
    }
}

function filterByProperties(cl, propValList) {
    var filteredCl = cl;
    for (var propVal of propValList) {
        filteredCl = filteredCl.filter(byProperty(propVal[0], propVal[1]))
    }
    return filteredCl;
}

export const processGameChange = (g1, g2, playerN, gameBroadcast, chatBroadcast) => {
    return null;
    // Work in progress.
    if (!g1 || !g2 || !playerN) return; 
    const cl1 = flatListOfCards(g1);
    const cl2 = flatListOfCards(g2);

    // Thurindir 
    if (g2.roundStep === "0.0") {
        const thurindir1 = filterByProperties(cl1, [["cardDbId", "12946b30-a231-4074-a524-960365081360"],"controller",playerN])
        const thurindir2 = filterByProperties(cl2, [["cardDbId", "12946b30-a231-4074-a524-960365081360"],"controller",playerN])
        if (thurindir2.length > thurindir1.length) {
            // Loaded a thurindir
            const sidequests = null;
        }
    }

    // for (var c=0; c<cl2.length; c++) {
    //     const c2 = cl2[c];
    //     const c1 = cl1.filter(byProperty("id",c2.id))[0];
    //     Object.keys(c1).forEach((prop, index) => {
    //         if (!isObject(c1[prop])) {
    //             if (c1[prop] !== c2[prop]) {
    //                 console.log(c1.sides.A.name, prop, c1[prop], c2[prop])
    //             }
    //         }
    //     })
    //     // if (JSON.stringify(c1) !== JSON.stringify(c2)) {
    //     //     console.log(c1,c2);
    //     // }
    // }
    //const player1Play1 = cl1.filter(byProperty("groupId","player1Play1"));
    //chatBroadcast("game_update", {message: " updated "+thurindir1?.length+" "+thurindir2?.length});

}