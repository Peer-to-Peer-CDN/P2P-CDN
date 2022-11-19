import {InfoDictionary} from "../../common/InfoDictionary";
import {CompleteEvent, ITorrentData} from "./ITorrentData";
import { IMediationClient } from "../mediation/IMediationClient";
import { TorrentData } from "./TorrentData";
import { IPeerWire } from "../peer/PeerWire";


export type PeerWireFactory = (td: ITorrentData, closedCallback: () => void) => any;

export class SwarmManager {
    private swarm : any[];
    private torrent_data: TorrentData;
    private readonly REQUEST_FOR_PEERS_INTERVAL_MS = 1000;
    private readonly MINIMUM_PEERS_THRESHHOLD = 1;

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
        mediation_client.requestPeers(this.torrent_data.info_dictionary.full_hash);
        setInterval(() => {
            if(!this.torrent_data.isComplete() && this.swarm.length < this.MINIMUM_PEERS_THRESHHOLD) {
                mediation_client.requestPeers(this.torrent_data.info_dictionary.full_hash);
            }
        }, this.REQUEST_FOR_PEERS_INTERVAL_MS);
    }

    private handleAddPeerEvent(peerWireFactory: PeerWireFactory) {
        let peer = peerWireFactory(this.torrent_data, () => {
            this.swarm = this.swarm.filter(wire => wire.isClosed === false);
        });

        this.torrent_data.addPieceEventListeners.push((idx: any) => peer.onNewPiece.apply(peer, [idx]));
        this.swarm.push(peer);
    }
}