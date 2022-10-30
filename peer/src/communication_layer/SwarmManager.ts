import {InfoDictionary} from "../common/InfoDictionary";
import {PeerIdentifier} from "../common/PeerIdentifier";
import {CompleteEvent, ITorrentData} from "./ITorrentData";
import { IMediationClient } from "./IMediationClient";
import { TorrentData } from "./TorrentData";


export type PeerWireFactory = (td: ITorrentData, peer_id: string) => any;

export class SwarmManager {
    private swarm : any[];
    private own_peer_id;
    private torrent_data;

    constructor(info_dictionary : InfoDictionary, mediation_client: IMediationClient, own_peer_id : PeerIdentifier, completeCallback: CompleteEvent) {
        this.swarm = [];
        this.own_peer_id = own_peer_id;
        this.torrent_data = new TorrentData(info_dictionary, completeCallback);
        mediation_client.register(info_dictionary.full_hash , this.handleAddPeerEvent.bind(this));
    }

    private swarmSize () :number {
        return this.swarm.length;
    }
    private handleAddPeerEvent(peerWireFactory: PeerWireFactory) {
        this.swarm.push(peerWireFactory(this.torrent_data, this.own_peer_id.toString()));
    }
}