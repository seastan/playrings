export interface Coordinates {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
export interface CoordinatesPerId {
    [index: string]: Coordinates;
}
export declare const getCoordinatesFromDiv: ({ div }: {
    div: HTMLDivElement;
}) => {
    top: number;
    bottom: number;
    left: number;
    right: number;
};
export declare const useCoordinatesPerId: () => {
    coordinates: CoordinatesPerId;
    setCoordinatesOfDivForId: ({ id, div }: {
        id: string;
        div: HTMLDivElement | null;
    }) => void;
};
