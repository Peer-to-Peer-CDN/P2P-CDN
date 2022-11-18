import {InfoDictionary} from "../../common/InfoDictionary";
import {CompleteEvent, ITorrentData} from "./ITorrentData";
import { IMediationClient } from "../mediation/IMediationClient";
import { TorrentData } from "./TorrentData";


export type PeerWireFactory = (td: ITorrentData, closedCallback: () => void) => any;

export class SwarmManager {
    private swarm : any[];
    private torrent_data: TorrentData;

    constructor(info_dictionary : InfoDictionary, mediation_client: IMediationClient, completeCallback: CompleteEvent, torrentData? : TorrentData) {
        this.swarm = [];
        if(torrentData) {
            this.torrent_data  = torrentData;
        } else {
            this.torrent_data = new TorrentData(info_dictionary, completeCallback, () => {
                mediation_client.announce(info_dictionary.full_hash);
            });
        }
        mediation_client.registerForPeers(info_dictionary.full_hash , this.handleAddPeerEvent.bind(this));
        if(! this.torrent_data.isComplete()) { //TODO: test
            console.log("starting incomplete");
            mediation_client.requestPeers(this.torrent_data.info_dictionary.full_hash);
        }
    }

    private swarmSize () :number {
        return this.swarm.length;
    }
    private handleAddPeerEvent(peerWireFactory: PeerWireFactory) {
        let peer = peerWireFactory(this.torrent_data, () => {
            this.swarm.filter(p => p !== peer); //TODO: test very much or even remove if unnecessary!!
        });
        this.torrent_data.addPieceEventListeners.push((idx: any) => peer.onNewPiece.apply(peer, [idx]));
        this.swarm.push(peer);
    }
}