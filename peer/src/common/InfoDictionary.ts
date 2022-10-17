import {PeerIdentifier} from "./PeerIdentifier";

export class InfoDictionary {
    full_hash;
    file_name;
    pieces_length;
    pieces_amount;
    total_length; 

    constructor(full_hash: string, file_name: string, pieces_length: number, pieces_amount: number, total_length: number) {
        this.full_hash = full_hash;
        this.file_name = file_name;
        this.pieces_length = pieces_length;
        this.pieces_amount = pieces_amount;
        this.total_length = total_length;
    }
}

