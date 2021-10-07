"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const useCoordinatesPerId_1 = require("./useCoordinatesPerId");
exports.ArrowsBetweenDivsContext = react_1.default.createContext({
    coordinatesPerId: {},
    debug: false,
    setCoordinatesOfDivForId: () => {
        throw new Error('ArrowsBetweenDivsContextProvider not found'); // throw error by default
    },
});
exports.ArrowsBetweenDivsContextProvider = ({ children, debug = false, }) => {
    // track state of coordinates in context
    const { coordinates, setCoordinatesOfDivForId } = useCoordinatesPerId_1.useCoordinatesPerId();
    // rename the method to make more sense to consumers
    const registerDivToArrowsContext = ({ id, div }) => setCoordinatesOfDivForId({ id, div });
    // render the children wrapped in context
    return (react_1.default.createElement(exports.ArrowsBetweenDivsContext.Provider, { value: { debug, coordinatesPerId: coordinates, setCoordinatesOfDivForId } }, children({ registerDivToArrowsContext })));
};
//# sourceMappingURL=ArrowsBetweenDivsContext.js.map