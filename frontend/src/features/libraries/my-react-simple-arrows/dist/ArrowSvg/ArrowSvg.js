"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const uuid_1 = __importDefault(require("uuid"));
const ArrowHeadMarkerSvg_1 = require("./ArrowHeadMarkerSvg");
const calculateAestheticLinePath_1 = require("./calculateAestheticLinePath");
const ARROW_LENGTH = 15;
const ARROW_WIDTH = 9;
exports.ArrowSvg = ({ start, end, orientation, curviness = 0.6, color = 'black', strokeWidth = '1', }) => {
    const headId = uuid_1.default();
    // define dimensions and coordinates of the svg plane
    const dimensions = {
        height: Math.abs(start.y - end.y),
        width: Math.abs(start.x - end.x),
    };
    const coordinates = {
        x: Math.min(start.x, end.x),
        y: Math.min(start.y, end.y),
    };
    // add room for padding to the svg plane
    const padding = ARROW_WIDTH; // as otherwise half of arrow head would be outside of svg when it goes to edge
    const paddedDimensions = {
        height: dimensions.height + padding,
        width: dimensions.width + padding,
    };
    const paddedCoordinates = {
        x: coordinates.x - padding / 2,
        y: coordinates.y - padding / 2,
    };
    // map the coordinates of the line from page coordinates into the svg plane coordinates (i.e., if starting at top left, the start coordinates would be (0, 0) plus padding offset)
    const innerStart = {
        x: start.x - paddedCoordinates.x,
        y: start.y - paddedCoordinates.y,
    };
    const innerEnd = {
        x: end.x - paddedCoordinates.x,
        y: end.y - paddedCoordinates.y,
    };
    // return arrow positioned absolutely at the viewport w/ arrows positioned internally
    return (react_1.default.createElement("svg", { height: paddedDimensions.height, width: paddedDimensions.width, style: { position: 'absolute', top: paddedCoordinates.y, left: paddedCoordinates.x, zIndex: 1e6, pointerEvents: "none" } },
        react_1.default.createElement("defs", null,
            react_1.default.createElement(ArrowHeadMarkerSvg_1.ArrowHeadMarkerSvg, { length: ARROW_LENGTH, width: ARROW_WIDTH, id: headId, color: color })),
        react_1.default.createElement("path", { d: calculateAestheticLinePath_1.calculateAestheticLinePath({
                start: innerStart,
                end: innerEnd,
                orientation,
                curviness,
            }), fill: "none", stroke: color, strokeWidth: strokeWidth, markerEnd: `url(#${headId})` })));
};
//# sourceMappingURL=ArrowSvg.js.map