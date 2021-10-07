import { LineOrientation, Position } from '../constants';
export declare const calculateAestheticLinePath: ({ start, end, curviness, orientation, }: {
    start: Position;
    end: Position;
    curviness: number;
    orientation: LineOrientation;
}) => string;
