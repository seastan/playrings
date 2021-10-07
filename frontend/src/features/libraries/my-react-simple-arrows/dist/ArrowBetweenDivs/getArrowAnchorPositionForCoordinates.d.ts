import { Position } from '../constants';
import { Coordinates } from './useCoordinatesPerId';
export declare enum ArrowAnchorPlacement {
    TOP = "TOP",
    BOTTOM = "BOTTOM",
    LEFT = "LEFT",
    RIGHT = "RIGHT"
}
export declare const getArrowAnchorPositionForCoordinates: ({ coordinates, placement }: {
    coordinates: Coordinates;
    placement: ArrowAnchorPlacement;
}) => Position;
