"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const ArrowSvg_1 = require("../ArrowSvg");
const ArrowsBetweenDivsContext_1 = require("./ArrowsBetweenDivsContext");
const getArrowAnchorPositionForCoordinates_1 = require("./getArrowAnchorPositionForCoordinates");
exports.ArrowBetweenDivs = ({ from, to, orientation, curviness, color = 'black', strokeWidth = '1', }) => {
    const { coordinatesPerId, debug } = react_1.useContext(ArrowsBetweenDivsContext_1.ArrowsBetweenDivsContext);
    // grab the from and to coordinates from the context
    const fromCoordinates = coordinatesPerId[from.id];
    if (!fromCoordinates && debug) {
        if (debug)
            console.warn(`ArrowBetweenDivs: coordinates for from.id ${from.id} are not defined yet`); // output message if in debug mode
    }
    const toCoordinates = coordinatesPerId[to.id];
    if (!toCoordinates) {
        if (debug)
            console.warn(`ArrowBetweenDivs: coordinates for to.id ${to.id} are not defined yet`); // output message if in debug mode
    }
    if (!fromCoordinates || !toCoordinates)
        return null; // render nothing, as the id is not defined yet
    // define the start and end position based on the coordinates
    const start = getArrowAnchorPositionForCoordinates_1.getArrowAnchorPositionForCoordinates({ coordinates: fromCoordinates, placement: from.placement });
    const end = getArrowAnchorPositionForCoordinates_1.getArrowAnchorPositionForCoordinates({ coordinates: toCoordinates, placement: to.placement });
    // return the arrow
    return react_1.default.createElement(ArrowSvg_1.ArrowSvg, { start: start, end: end, orientation: orientation, curviness: curviness, color: color, strokeWidth: strokeWidth });
};
//# sourceMappingURL=ArrowBetweenDivs.js.map