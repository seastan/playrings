/// <reference types="react" />
import { LineOrientation } from '../constants';
import { ArrowAnchorPlacement } from './getArrowAnchorPositionForCoordinates';
export interface ArrowDivAnchorDefinition {
    id: string;
    placement: ArrowAnchorPlacement;
}
export declare const ArrowBetweenDivs: ({ from, to, orientation, curviness, color, strokeWidth, }: {
    from: ArrowDivAnchorDefinition;
    to: ArrowDivAnchorDefinition;
    orientation: LineOrientation;
    curviness?: number | undefined;
    color?: string | undefined;
    strokeWidth?: string | undefined;
}) => JSX.Element | null;
