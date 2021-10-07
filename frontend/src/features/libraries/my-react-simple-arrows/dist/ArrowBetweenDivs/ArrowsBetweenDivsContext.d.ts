import React from 'react';
import { CoordinatesPerId } from './useCoordinatesPerId';
interface ArrowsBetweenDivContextData {
    coordinatesPerId: CoordinatesPerId;
    setCoordinatesOfDivForId: (args: {
        id: string;
        div: HTMLDivElement;
    }) => void;
    debug: boolean;
}
export declare const ArrowsBetweenDivsContext: React.Context<ArrowsBetweenDivContextData>;
/**
 * registering divs into the ArrowsBetweenDivsContext, so that they can be found by id in the ArrowBetweenDivs component
 *
 * example:
 * ```
 * <div ref={(div) => registerDivToArrowsContext({ id: '__SOME_ID__', div })} />
 * ```
 * */
declare type RegisterDivForArrowsContext = (args: {
    id: string;
    div: HTMLDivElement | null;
}) => void;
export declare const ArrowsBetweenDivsContextProvider: ({ children, debug, }: {
    children: (args: {
        registerDivToArrowsContext: RegisterDivForArrowsContext;
    }) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>;
    debug?: boolean | undefined;
}) => JSX.Element;
export {};
