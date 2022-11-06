import BitField from "bitfield";
import { AnnounceEvent, CompleteEvent, ITorrentData } from "./ITorrentData";
import {InfoDictionary} from "../../common/InfoDictionary";


export class TorrentData implements ITorrentData{
    private pieces : ArrayBuffer[];
    private piece_index_to_timeout_id = new Map();
    info_dictionary : InfoDictionary;
    readonly timeout_in_ms = 500;
    private number_of_complete_pieces = 0;
    private completeCallback: CompleteEvent;
    private announceCallback: AnnounceEvent;

    constructor(info_dictionary: InfoDictionary, completeCallback: CompleteEvent, announceCallback: AnnounceEvent, pieces: ArrayBuffer[] = []) {
        this.info_dictionary = info_dictionary;
        this.pieces = pieces;
        this.completeCallback = completeCallback;
        this.announceCallback = announceCallback;
        if(this.pieces.length > 0) {
            announceCallback();
        }
    }

    getHaveField() : Array<boolean> {
        let bf = [] 
        for(let i = 0; i < this.info_dictionary.pieces_amount; i++) {
            if(this.pieces[i]) {
                bf[i] = true;
            } 
            
        }
        return bf;
    }

    isComplete() : boolean {
        return this.number_of_complete_pieces === this.info_dictionary.pieces_amount;
    }

    remainingAmount() : number {
        return this.info_dictionary.pieces_amount - this.number_of_complete_pieces;
    }

    addPiece(piece_index: number, data: ArrayBuffer) {

        if(this.number_of_complete_pieces === 0) {
            this.announceCallback();
        }
        //todo: check integrity of piece

        clearTimeout(this.piece_index_to_timeout_id.get(piece_index));

        this.number_of_complete_pieces++;
        this.pieces[piece_index]  = data;

        if(this.isComplete()) {
            this.complete();
        }
    }

    private complete() { //todo: find use for this or remove
        this.completeCallback(this.pieces);
        for(let i = 0; i < this.info_dictionary.pieces_amount; i++) { //todo: remove
            let arr = new Uint8Array(this.pieces[i]);
            for(let j = 0; j < 100; j++) {
                if(i < 4 || j < 50) {
                    //console.log(arr.at(j)); 
                }
            }
        }
    }

    havePiece(piece_index: number) {
        return !!this.pieces[piece_index];
    }

    getPiece(piece_index: number){
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
