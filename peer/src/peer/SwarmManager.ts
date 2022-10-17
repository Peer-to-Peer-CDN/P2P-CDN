import {InfoDictionary} from "../common/InfoDictionary";
import BittorrentProtocol from "bittorrent-protocol";
import {PeerIdentifier} from "../common/PeerIdentifier";
import {PeerWire} from "./PeerWire";
import {TorrentData} from "./TorrentData";
import { IP2PTransport } from "../communication/IP2PTransport";
import { IMediationClient } from "../mediation_client/IMediationClient";

export class SwarmManager {
    private info_dictionary : InfoDictionary;
    private swarm : PeerWire[];
    private mediation_client;
    private own_peer_id;
    private readonly torrent_data;

    constructor(info_dictionary : InfoDictionary, mediation_client: IMediationClient, own_peer_id : PeerIdentifier) {
        this.info_dictionary = info_dictionary;
        this.mediation_client = mediation_client;
        this.own_peer_id = own_peer_id;
        mediation_client.register(info_dictionary.full_hash , this.handleAddPeerEvent);
        this.torrent_data = new TorrentData(info_dictionary);
    }

    private handleAddPeerEvent(peer_id: PeerIdentifier, rtc: IP2PTransport, initiate: boolean) {
        let wire = new BittorrentProtocol();

        rtc.pipe(wire).pipe(rtc);

        if(initiate) {
            wire.handshake(this.info_dictionary.full_hash, this.own_peer_id.toString());
        }

        wire.on('handshake', (info_hash, sender_peer_id: PeerIdentifier, _ /*extension*/) => {
            if(info_hash !== this.info_dictionary.full_hash) {
                console.error("Error on handshake. Hash mismatch.");
            }
            if(sender_peer_id != peer_id) {
                console.error("Error on handshake. Peer ID mismatch");
            }

            this.swarm.push(new PeerWire(wire, this.torrent_data));

            if(!initiate) {
                wire.handshake(this.info_dictionary.full_hash, this.own_peer_id.toString());
            }
        });

    }
}
