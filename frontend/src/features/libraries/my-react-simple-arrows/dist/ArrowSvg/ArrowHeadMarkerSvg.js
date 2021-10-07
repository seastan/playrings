"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
// based on https://github.com/pierpo/react-archer/blob/master/src/ArcherContainer.js#L293
exports.ArrowHeadMarkerSvg = ({ id, length, width, color = 'black' }) => {
    const arrowPath = `M0,0 L0,${width} L${length - 1},${width / 2} z`;
    if (length < width)
        throw new Error('arrow head width must be less than length');
    return (react_1.default.createElement("marker", { id: id, key: id, markerWidth: length, markerHeight: width, refX: length - width / 2, refY: width / 2, orient: "auto", markerUnits: "userSpaceOnUse" },
        react_1.default.createElement("path", { d: arrowPath, fill: color })));
};
//# sourceMappingURL=ArrowHeadMarkerSvg.js.map