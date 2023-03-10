import { AnnounceEvent, CompleteEvent, ITorrentData } from "./ITorrentData";
import {InfoDictionary} from "../../common/InfoDictionary";
var crypto = require('crypto');

function hash(input : string ) : string {
    var shasum = crypto.createHash('sha1');
    shasum.update(input);
    return shasum.digest('hex');
}

export function generateFullHash(pieces: ArrayBuffer[]) : string {
    let content: string[] = [];
    pieces.forEach(piece => {
        let str = "";
        let view = new Uint8Array(piece);
        for(let i = 0; i < view.length; i++) {
            str += String.fromCharCode(view.at(i)!);
        }
        content.push(hash(str));
    });
    if(!!content) {
        return generateMerkleRoot(content);
    } else {
        return "";
    }
}

export function generateMerkleRoot(hashes: string[]) : string {
    if(hashes.length <= 1) {
        return hashes[0];
    }
    let newHashes = [];
    for(let i = 0; i < hashes.length; i += 2) {
        newHashes.push(hash(hashes[i] + hashes[i + 1]));
    }
    return generateMerkleRoot(newHashes);
}

export type addPieceEventHandler = (index: number) => void;
export class TorrentData implements ITorrentData{
    private pieces : ArrayBuffer[];
    private piece_index_to_timeout_id = new Map();
    info_dictionary : InfoDictionary;
    readonly timeout_in_ms = 2000;
    private number_of_complete_pieces = 0;
    private completeCallback: CompleteEvent;
    private announceCallback: AnnounceEvent;

    addPieceEventListeners: addPieceEventHandler[] = [];

    constructor(info_dictionary: InfoDictionary, completeCallback: CompleteEvent, announceCallback: AnnounceEvent, pieces: ArrayBuffer[] = []) {
        this.info_dictionary = info_dictionary;
        this.pieces = pieces;
        pieces.forEach(p => {
            if(p) {
                this.number_of_complete_pieces++;
            }
        });
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
        if(this.pieces[piece_index]) {
            return;
        }
        if(this.info_dictionary.piece_hashes![piece_index]) {
            if( generateFullHash([data]) !== this.info_dictionary.piece_hashes[piece_index] ) {
                console.error("wrong piece received");
                return;
            }
        }

        if(this.number_of_complete_pieces === 0) {
            this.announceCallback();
        }

        clearTimeout(this.piece_index_to_timeout_id.get(piece_index));
        this.pieces[piece_index]  = data;
        this.addPieceEventListeners.forEach(cb => {cb(piece_index);});
        this.number_of_complete_pieces++;

        if(this.isComplete()) {
            this.complete();
        }
    }

    private complete() { 
        if(this.info_dictionary.full_hash === generateFullHash(this.pieces)) {
            this.completeCallback(this.pieces);
        } else {
            console.error("Received wrong file", this.info_dictionary.full_hash, "vs", generateFullHash(this.pieces));
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
            this.piece_index_to_timeout_id.delete(piece_index);
        }, this.timeout_in_ms));

        return true;
    }

}
