import {PeerIdentifier} from "../common/PeerIdentifier";
import {Wire} from "bittorrent-protocol";
export {Peer};

class Peer {
    peer_id;
    wire;
    constructor(peer_id: PeerIdentifier, wire: Wire) {
        this.peer_id = peer_id;
        this.wire = wire;
    }
}
