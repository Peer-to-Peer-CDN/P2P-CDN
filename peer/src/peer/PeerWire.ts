import {TorrentData} from "./TorrentData";
import BittorrentProtocol from "bittorrent-protocol";


type Wire = BittorrentProtocol.Wire;
export class PeerWire {
    private torrent_data : TorrentData;
    private peer: Wire;

    constructor(peer: Wire, torrent_data: TorrentData) {
        this.torrent_data = torrent_data;
        this.peer = peer;

        peer.on('piece', this.onPiece);
        peer.on('choke',  this.onChoke);
        peer.on('unchooke', this.onUnchoke);
        peer.on('interested',  this.onInterested);
        peer.on('uninterested', this.onUninterested);
        peer.on('bitfield', this.onBitfield);
        peer.on('have', this.onHave);
        peer.on('request', this.onRequest);
    }

    run() {
        let index = this.torrent_data.nextNeededPieceIndex();
        while(!this.peer.peerPieces.get(index))  {
            index = this.torrent_data.nextNeededPieceIndex();
        }

        this.torrent_data.acquirePiece(index);
        let info = this.torrent_data.info_dictionary;
        let piece_length = info.pieces_amount === index ?
            info.total_length % info.pieces_length :
            info.pieces_length;

        this.peer.wire.request(index, 0, piece_length, (err: Error) => {
            if(err) {
                console.error(err);
            }


        });
    }

    private onPiece(index:number, offset:number, buffer: ArrayBuffer) {
        this.torrent_data.addPiece(index, buffer);
        if(!this.torrent_data.isComplete()) {
            if(!this.peer.wire.peerChoking) {
                this.run();
            }
        }
    }

    private onChoke() {

    }

    private onUnchoke() {
        this.run();
    }

    private onInterested() {

    }

    private onUninterested() {

    }

    private onBitfield(bitfield : any) { //bitfield supports .get(index) : boolean
    }

    private onHave(piece_index : number) {

    }

    private onRequest(piece_index : number, offset : number, length : number, callback :any) {
        if(this.torrent_data.havePiece(piece_index)){
            callback(null, this.torrent_data.getPiece(piece_index).slice(offset, offset + length));
        }
    }
}
