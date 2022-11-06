import BitField from "bitfield";
import { InfoDictionary } from "../../common/InfoDictionary";

export type AnnounceEvent = () => void;
export type CompleteEvent = (data: ArrayBuffer[]) => void;
export interface ITorrentData {
    info_dictionary: InfoDictionary;
    // array of booleans, true if piece is available
    getHaveField () : Array<boolean>;
    // all pieces are available
    isComplete() : boolean;
    // amount of pieces that are not available
    remainingAmount() : number;
    // add a piece
    addPiece(index: number, data: ArrayBuffer) : void;
    // check if piece is availble
    havePiece(index: number) : boolean;
    // get a piece
    getPiece(index: number) : ArrayBuffer;
    // get a piece index  that is not available yet and not currently downloading
    nextNeededPieceIndex() : number;
    // reserve a pice for downloading
    acquirePiece(index: number) : boolean;
}