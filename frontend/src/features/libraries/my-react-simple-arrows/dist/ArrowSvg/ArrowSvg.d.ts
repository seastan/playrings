/// <reference types="react" />
import { LineOrientation, Position } from '../constants';
export declare const ArrowSvg: ({ start, end, orientation, curviness, color, strokeWidth, }: {
    start: Position;
    end: Position;
    orientation: LineOrientation;
    curviness?: number | undefined;
    color?: string | undefined;
    strokeWidth?: string | undefined;
}) => JSX.Element;
