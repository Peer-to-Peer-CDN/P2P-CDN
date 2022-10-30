import { IP2PTransport } from "../transport_layer/IP2PTransport";
import { IMediationClient, MediationEventHandler } from "./IMediationClient";
import { ITorrentData } from "./ITorrentData";
import { PeerWire } from "./PeerWire";
import {MediationProtocol} from "../../../common/MediationProtocol";
import {io} from "socket.io-client";
import SimplePeer from "simple-peer";


export class MediationClient implements IMediationClient{
    private add_peer_event_handlers = new Map<string, MediationEventHandler>(); //full_hash => peer_event_handler()
    private protocol: MediationProtocol; 
    private peerId;
    private RTCs : Map<string, SimplePeer.Instance>; //map peerId to SimplePeers instances
    constructor(peerId: string, mediatorAddress: string, mediatorPort: number) {
        const socket = io(`ws://${mediatorAddress}:${mediatorPort}`);
        this.peerId = peerId;
        this.protocol = new MediationProtocol(socket);
        this.protocol.on('peers', (...args) => this.onPeers.apply(this, ...args)); 
        this.protocol.on('signal', (...args) => this.onSignal.apply(this, ...args));
    }

    private onPeers(full_hash: string, peerList: string[]) {
        peerList.forEach(peer => {
            let rtc = new SimplePeer({initiator: true});
            if(!this.RTCs.get(peer)) {
                this.RTCs.set(peer, rtc);
            }
            this.RTCs.get(full_hash)?.push(rtc);
            rtc.on('connect', () => {
                this.addPeer(full_hash, rtc, true);
            });
            rtc.on('signal', (data:any) => {
                this.protocol.signal(full_hash, this.peerId, peer, JSON.stringify(data));
            });
        });
    }

    private onSignal(full_hash:string, senderPeer:string, _receiverPeer:string, signalData:string) {
        let rtc = this.RTCs.get(senderPeer);
        if(!rtc) { //new peer trying to connect to us!
            rtc = new SimplePeer({initiator: false});
            rtc.signal(JSON.parse(signalData));
            rtc.on('signal', data => {
                this.protocol.signal(this.peerId, senderPeer, JSON.stringify(data));
            });
            rtc.on('connect', () => {
                //@ts-ignore
                this.addPeer(full_hash, rtc, false);
            });
        } else { //existing peer
            rtc.signal(JSON.parse(signalData));
        }
    }

    requestPeers(full_hash: string) {
        this.protocol.get_peers(full_hash);
    }

    announce(full_hash: string) {
        this.protocol.announce(this.peerId, full_hash);
    }

    finish(full_hash: string) {
        this.protocol.finish(this.peerId, full_hash);
    }

    registerForPeers(full_hash: string, event_handler: MediationEventHandler) : void {
        this.add_peer_event_handlers.set(full_hash, event_handler);
    }

    private addPeer(full_hash: string, rtc: IP2PTransport, initiator: boolean) {
        let cb = this.add_peer_event_handlers.get(full_hash)
        if(cb) {
            cb((torrent_data: ITorrentData, peer_id: string) => {
                return new PeerWire(rtc, torrent_data, initiator, peer_id);
            });
        }
    }
}
