"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const window_size_1 = __importDefault(require("@rehooks/window-size"));
const react_1 = require("react");
exports.getCoordinatesFromDiv = ({ div }) => {
    const box = div.getBoundingClientRect();
    const coordinates = {
        top: box.top + window.scrollY,
        bottom: box.bottom + window.scrollY,
        left: box.left + window.scrollX,
        right: box.right + window.scrollX,
    };
    return coordinates;
};
exports.useCoordinatesPerId = () => {
    window_size_1.default(); // use window size to trigger state update when size changes -> triggers recalculation of coordinates
    const [coordinates, setCoordinates] = react_1.useState({});
    const setCoordinatesOfDivForId = ({ id, div }) => {
        if (!div)
            return; // do nothing if div not defined
        const priorCoordinates = coordinates[id];
        const currentCoordinates = exports.getCoordinatesFromDiv({ div });
        if (JSON.stringify(priorCoordinates) !== JSON.stringify(currentCoordinates)) {
            setCoordinates(Object.assign({}, coordinates, { [id]: currentCoordinates }));
        }
    };
    return { coordinates, setCoordinatesOfDivForId };
};
//# sourceMappingURL=useCoordinatesPerId.js.map