"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ArrowAnchorPlacement;
(function (ArrowAnchorPlacement) {
    ArrowAnchorPlacement["TOP"] = "TOP";
    ArrowAnchorPlacement["BOTTOM"] = "BOTTOM";
    ArrowAnchorPlacement["LEFT"] = "LEFT";
    ArrowAnchorPlacement["RIGHT"] = "RIGHT";
})(ArrowAnchorPlacement = exports.ArrowAnchorPlacement || (exports.ArrowAnchorPlacement = {}));
exports.getArrowAnchorPositionForCoordinates = ({ coordinates, placement }) => {
    // calculate the center position
    const width = coordinates.right - coordinates.left;
    const height = coordinates.bottom - coordinates.top;
    const center = {
        x: coordinates.left + width / 2,
        y: coordinates.top + height / 2,
    };
    // determine where the anchor position should be
    if (placement === ArrowAnchorPlacement.TOP) {
        return {
            x: center.x,
            y: coordinates.top,
        };
    }
    if (placement === ArrowAnchorPlacement.BOTTOM) {
        return {
            x: center.x,
            y: coordinates.bottom,
        };
    }
    if (placement === ArrowAnchorPlacement.LEFT) {
        return {
            x: coordinates.left,
            y: center.y,
        };
    }
    if (placement === ArrowAnchorPlacement.RIGHT) {
        return {
            x: coordinates.right,
            y: center.y,
        };
    }
    throw new Error('invalid placement requested');
};
//# sourceMappingURL=getArrowAnchorPositionForCoordinates.js.map