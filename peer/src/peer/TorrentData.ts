import {InfoDictionary} from "../common/InfoDictionary";

export class TorrentData {
    private pieces : ArrayBuffer[];
    private piece_index_to_timeout_id = new Map();
    info_dictionary : InfoDictionary;
    readonly timeout_in_ms = 2000;
    private number_of_complete_pieces = 0;

    constructor(info_dictionary: InfoDictionary) {
        this.info_dictionary = info_dictionary;
    }

    isComplete() : boolean {
        return this.number_of_complete_pieces === this.info_dictionary.pieces_amount;
    }

    addPiece(piece_index: number, data: ArrayBuffer) {
        if(this.isComplete()) {
            return;
        }

        //todo: check integrity of piece

        let timeout_id = this.piece_index_to_timeout_id.get(piece_index)
        clearTimeout(timeout_id);
        this.number_of_complete_pieces++;
        this.pieces[piece_index]  = data;
    }

    havePiece(piece_index: number) {
        return !!this.pieces[piece_index];
    }

    getPiece(piece_index: number) {
        return this.pieces[piece_index];
    }

    nextNeededPieceIndex() : number {
        let current_index = 0;
        while(this.piece_index_to_timeout_id.has(current_index)) {
            current_index++;
        }
        return current_index;
    }

    acquirePiece(piece_index: number) : boolean{
        if(this.piece_index_to_timeout_id.has(piece_index)) {
            return false;
        }

        this.piece_index_to_timeout_id.set(piece_index, setTimeout(() => {
            //todo: cancel request
            this.piece_index_to_timeout_id.delete(piece_index);
        }, this.timeout_in_ms));

        return true;
    }

}
