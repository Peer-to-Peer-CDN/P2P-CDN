import { IP2PTransport } from "../../transport_layer/IP2PTransport";
import { IMediationClient, MediationEventHandler } from "./IMediationClient";
import { ITorrentData } from "../swarm/ITorrentData";
import { PeerWire } from "../peer/PeerWire";
import { ConnectionKeyWords, ConnectionType, MediationProtocol} from "../../../../common/MediationProtocol";
var io = require('socket.io-client');
import SimplePeer from "simple-peer";
import { ICEConfig } from "./ICEConfig";

export type ICECandidate = {urls: string, username?: string, credential?:string};
export class MediationClient implements IMediationClient{
    private add_peer_event_handlers = new Map<string, MediationEventHandler>(); //full_hash => peer_event_handler()
    private protocol: MediationProtocol;
    private peerId;
    private RTCs : Map<string, SimplePeer.Instance> = new Map(); //map peerId to SimplePeers instances

    private iceServers: ICECandidate[]; 

    private peerIdBlackList = new Set<string>();

    constructor(peerId: string, socketFactory: any, iceCandidates?: ICECandidate[]) { //socketFactory = () => any;
        if(iceCandidates) {
            this.iceServers = iceCandidates;
        } else {
            this.iceServers = ICEConfig;
        }
        const socket = socketFactory()
        this.protocol = new MediationProtocol(socket);
        this.peerId = peerId;
        this.protocol.handshake(this.peerId, ConnectionType.MEDIATION);
        this.protocol.on(ConnectionKeyWords.ESTABLISHED, () => {
            this.protocol.on(ConnectionKeyWords.PEERS, (...args) => this.onPeers.apply(this, args));
            this.protocol.on(ConnectionKeyWords.SIGNAL, (...args) => this.onSignal.apply(this, args));
        });
    }

    private onPeers(full_hash: string, peerList: string[]) {
        peerList?.forEach(peer => {
            if(peer === this.peerId) { //TODO test if branch!!
                return;
            }
            if(this.peerIdBlackList.has(peer)) { //ALREADY downloaded
                return;
            }
            this.peerIdBlackList.add(peer);
            let rtc = new SimplePeer({initiator: true,trickle: false, config: { iceServers: this.iceServers}});
            rtc.on('error', err => console.warn(err, this.iceServers));
            if(!this.RTCs.get(peer)) {
                this.RTCs.set(peer, rtc);
            }
            rtc.on(ConnectionKeyWords.CONNECT, () => {
                this.addPeer(full_hash, rtc, true);
            });
            rtc.on(ConnectionKeyWords.SIGNAL, (data:any) => {
                this.protocol.signal(full_hash, peer, JSON.stringify(data));
            });
        });
    }

    private onSignal(full_hash: string, senderPeer:string, signalData:string) {
        let rtc = this.RTCs.get(senderPeer);
        if(!rtc) { //new peer trying to connect to us!
            rtc = new SimplePeer({initiator: false, trickle: false, config: { iceServers: this.iceServers}});
            rtc.signal(JSON.parse(signalData));
            rtc.on('error', err => console.warn(err, this.iceServers));
            rtc.on(ConnectionKeyWords.SIGNAL, data => {
                this.protocol.signal(full_hash, senderPeer, JSON.stringify(data));
            });
            rtc.on(ConnectionKeyWords.CONNECT, () => {
                //@ts-ignore //rtc is not assignable to type IP2PTransport for some reason, should still work.
                this.addPeer(full_hash, rtc, false);
            });
        } else { //existing peer
            rtc.signal(JSON.parse(signalData));
        }
    }

    public requestPeers(full_hash: string) {
        this.protocol.get_peers(full_hash);
    }

    public announce(full_hash: string) {
        this.protocol.announce(full_hash);
    }

    public finish(full_hash: string) {
        this.protocol.finish(full_hash);
    }

    public registerForPeers(full_hash: string, event_handler: MediationEventHandler) : void {
        this.add_peer_event_handlers.set(full_hash, event_handler);
    }

    private addPeer(full_hash: string, rtc: IP2PTransport, initiator: boolean) {
        let cb = this.add_peer_event_handlers.get(full_hash)
        if(cb) {
            cb((torrent_data: ITorrentData, closedCallback: () => void) => {
                return new PeerWire(rtc, torrent_data, initiator, this.peerId, closedCallback);
            });
        }
    }
}
