export class InfoDictionary {
    full_hash;
    file_name;
    pieces_length;
    pieces_amount;
    total_length; 
    piece_hashes;

    constructor(full_hash: string, file_name: string, pieces_length: number, pieces_amount: number, total_length: number, piece_hashes?: string[]) {
        this.full_hash = full_hash;
        this.file_name = file_name;
        this.pieces_length = pieces_length;
        this.pieces_amount = pieces_amount;
        this.total_length = total_length;
        this.piece_hashes = piece_hashes || [];
    }
}

