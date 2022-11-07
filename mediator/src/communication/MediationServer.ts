import {Server} from "socket.io";
import {MediationProtocol} from "../../../common/MediationProtocol";
import {PeerConnector} from "./PeerConnector";

export class MediationServer {
    private server: Server;
    private fullHashesWithPeerIds: Map<string, string[]> = new Map(); // fullHash, peerIds
    private peers: Map<string, MediationProtocol> = new Map();
    //private peerConnectors: PeerConnector[] = [];

    constructor(server: Server) {
        this.server = server;

        // TODO: Remove. For test / debug purposes only.
        this.fullHashesWithPeerIds.set("test m1", ["m1.1", "m1.2", "m1.3"]);
        this.fullHashesWithPeerIds.set("test m2", ["m2.1", "m2.2", "m2.3"]);
    }

    public run() {
        this.server.on('connection', (socket) => {
            //TODO: Set peerId of sender
            const peerId = this.peers.size.toString();
            console.log("New peerId: " + peerId);

            const mediation = new MediationProtocol(socket);
            this.peers.set(peerId, mediation);

            //const peerConnector = new PeerConnector(peerId, mediation);
            //this.peerConnectors.push(peerConnector);

            mediation.on('get_peers', (...args) => this.onGetPeers.apply(this, args));//args.forEach(a=>console.log(a)));// this.onGetPeers.apply(this, args));
            mediation.on('peers', (...args) => this.onPeers.apply(this, args));
            mediation.on('signal', (...args) => this.onSignal.apply(this, args));
            mediation.on('announce', (...args) => this.onAnnounce.apply(this, args));
            mediation.on('finish', (...args) => this.onFinish.apply(this, args));
        });
    }

    private onGetPeers(fullHash: string, senderPeerId: string) {
        const peerIds = this.fullHashesWithPeerIds.get(fullHash);
        if (peerIds != null) {
            this.peers.get(senderPeerId)?.peers(fullHash, peerIds);
        } else {
            // TODO: DHT lookup
        }
    }

    private onPeers(fullHash: string, peerList: string[]) {
        //TODO: Do nothing
    }

    private onSignal(fullHash: string, senderPeerId: string, receiverPeerId: string, signalData: string) {
        const targetMediation = this.peers.get(receiverPeerId);

        if (targetMediation != null) {
            targetMediation.signal(fullHash, senderPeerId, receiverPeerId, signalData);
        } else {
            // TODO: Signal to other mediator
        }
    }

    private onAnnounce(seederPeerId: string, fullHash: string) {
        let peerIds = this.fullHashesWithPeerIds.get(fullHash);

        if (peerIds == null) {
            peerIds = [seederPeerId];
        } else {
            peerIds.push(seederPeerId);
        }

        this.fullHashesWithPeerIds.set(fullHash, peerIds);
    }

    private onFinish(seederPeerId: string, fullHash: string) {
        let peerIds = this.fullHashesWithPeerIds.get(fullHash);

        if (peerIds != null) {
            peerIds = peerIds.filter(peerId => peerId !== seederPeerId);
            this.fullHashesWithPeerIds.set(fullHash, peerIds);
        }
    }

    /*private getConnectionByPeerId(peerId: string): PeerConnector{
        return this.peerConnectors[0];
    }*/
}