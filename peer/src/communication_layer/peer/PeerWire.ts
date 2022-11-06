import BittorrentProtocol from "bittorrent-protocol";
import { IP2PTransport } from "../../transport_layer/IP2PTransport";
import BitField from "bitfield";
import { ITorrentData } from "../swarm/ITorrentData";

export interface IPeerWire {

}
type Wire = BittorrentProtocol.Wire;
export class PeerWire implements IPeerWire{
    private torrent_data : ITorrentData;
    private peer: Wire;
    private readonly no_pieces_timeout: number = 500;

    constructor(stream: IP2PTransport, torrent_data: ITorrentData, initiator: boolean, peerId: string) {
        this.torrent_data = torrent_data;
        this.peer = new BittorrentProtocol();
        stream.pipe(this.peer).pipe(stream);

        if(initiator) {
            this.peer.handshake(torrent_data.info_dictionary.full_hash, peerId);
        }

        this.peer.on('handshake', (infoHash, peerIdRec, _) => {
            if(this.torrent_data.info_dictionary.full_hash != infoHash) {
                this.peer.destroy();
                stream.destroy();
                console.error("Error: Handshake failed because of a infoHash mismatch");
            }

            if(!initiator) {
                this.peer.handshake(torrent_data.info_dictionary.full_hash, peerId);
            }
            let haveField = this.torrent_data.getHaveField();
            let bitfield = new BitField(this.torrent_data.info_dictionary.pieces_amount);
            for(let i = 0; i < haveField.length; i++) {
                if(haveField[i]) {bitfield.set(i);}
            }
            this.peer.bitfield(bitfield);
        });
        this.registerHandlers();
    }

    private registerHandlers() {
        this.peer.on('piece', (...args) => this.onPiece.apply(this, args));
        this.peer.on('choke',  (...args) => this.onChoke.apply(this, args));
        this.peer.on('unchoke', (...args) => this.onUnchoke.apply(this, args)); 
        this.peer.on('interested',  (...args) => this.onInterested.apply(this, args));
        this.peer.on('uninterested', (...args) => this.onUninterested.apply(this,args));
        this.peer.on('bitfield', (...args) => this.onBitfield.apply(this,args));
        this.peer.on('have', (...args) => this.onHave.apply(this,args));
        this.peer.on('request', (...args) => this.onRequest.apply(this,args));

    }

    private run() {
        if(this.torrent_data.isComplete()) {
            return;
        }
        console.log('running');
        if(!this.choosePieceAndRequestOnFound()) {
            let intervalToken = setInterval(() => {
                if(this.choosePieceAndRequestOnFound()) {
                    clearInterval(intervalToken);
                } 
            }, this.no_pieces_timeout)   
        }
    } 

    private choosePieceAndRequestOnFound() : boolean{
        let index = this.torrent_data.nextNeededPieceIndex();
        for(let i = 0; i < this.torrent_data.remainingAmount(); i++) {
            if(this.peer.peerPieces.get(index)) {
                console.log("requesting!");
                this.request(index);
                return true;
            } else {
                index = this.torrent_data.nextNeededPieceIndex();
            }
        }
        return false;
    }

    private request(index:number) {
        this.torrent_data.acquirePiece(index);
        let info = this.torrent_data.info_dictionary;
        let piece_length = info.pieces_amount === index ?
            info.total_length % info.pieces_length :
            info.pieces_length;
        
        this.peer.unchoke()
        console.log("unchoked!");
        if(!this.peer.peerChoking) {
            console.log("requesting ... peer is not choking"); 
            this.peer.request(index, 0, piece_length, (err: Error) => {
                console.log('requested!');
                if(err) {
                    console.error(err);
                }
            });
        }
    }

    private onPiece(index:number, offset:number, buffer: ArrayBuffer) {
        console.log('received!');
        this.torrent_data.addPiece(index, buffer);
        if(!this.peer.peerChoking) {
            this.run(); 
        }
    } 

    private onChoke() {

    }

    private onUnchoke() {
        console.log('unchoked');
        this.run();
    }

    private onInterested() {

    }

    private onUninterested() {

    }

    private onBitfield(bitfield : any) { //bitfield supports .get(index) : boolean
        this.peer.unchoke();
        this.peer.interested();
    }

    private onHave(piece_index : number) {

    }

    private onRequest(piece_index : number, offset : number, length : number, callback :any) {
        console.log("received request!");
        if(this.torrent_data.havePiece(piece_index)){
            callback(null, new Uint8Array(this.torrent_data.getPiece(piece_index).slice(offset, offset + length)));
        }
    }
}