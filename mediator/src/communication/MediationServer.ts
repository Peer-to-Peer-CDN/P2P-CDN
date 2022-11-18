import {Server} from "socket.io";
import {ConnectionType, MediationProtocol} from "../../../common/MediationProtocol";
import {PeerConnector} from "./PeerConnector";
import {IMediationSemantic} from "./IMediationSemantic";

export class MediationServer {
    private server: Server;
    private fullHashesWithPeerIds: Map<string, string[]> = new Map(); // fullHash, peerIds
    private peerConnectorsWithId: Map<string, IMediationSemantic> = new Map(); // peerId, PeerConnector

    constructor(server: Server) {
        this.server = server;
    }

    public run() {
        this.server.on('connection', (socket) => {
            const mediation = new MediationProtocol(socket);

            mediation.on('handshake', (peerId, connectionType) => {
                let semantic: IMediationSemantic;

                if (connectionType == ConnectionType.MEDIATION) {
                    semantic = new PeerConnector(
                        peerId,
                        mediation,
                        (...args: any[]) => this.getConnectionByPeerId.apply(this, args),
                        (...args: any[]) => this.getPeerIdsByFullHash.apply(this, args),
                        (...args: any[]) => this.updatePeerIds.apply(this, args));
                    this.peerConnectorsWithId.set(peerId, semantic);
                } else if (connectionType == ConnectionType.REPLICATION) {
                    // TODO: MediationReplication
                } else {
                    return;
                }

                mediation.established();

                mediation.on('get_peers', (...args) => semantic.onGetPeers.apply(semantic, args));
                mediation.on('peers', (...args) => semantic.onPeers.apply(semantic, args));
                mediation.on('signal', (...args) => semantic.onSignal.apply(semantic, args));
                mediation.on('announce', (...args) => semantic.onAnnounce.apply(semantic, args));
                mediation.on('finish', (...args) => semantic.onFinish.apply(semantic, args));

                socket.on('disconnect', () => {
                    console.log("disconnect");
                    // TODO: Delete all peer ids from fullHashesWithPeerIds
                    this.peerConnectorsWithId.delete(peerId);
                });
            });
        });
    }

    private getPeerIdsByFullHash(fullHash: string): string[] {
        const peerIds = this.fullHashesWithPeerIds.get(fullHash);
        if (peerIds != null) {
            return peerIds;
        }

        return [];
    }

    private getConnectionByPeerId(peerId: string): MediationProtocol | undefined {
        const peerConnector = this.peerConnectorsWithId.get(peerId);
        if (peerConnector != null) {
            return peerConnector.getConnection();
        } else {
            // TODO: Signal to other mediator
            //throw new Error("peerConnector is null");
            return undefined;
        }
    }

    private updatePeerIds(fullHash: string, peerId: string, remove: boolean) {
        if (remove) {
            this.removePeerId(fullHash, peerId);
        } else {
            this.addPeerId(fullHash, peerId);
        }
    }

    private addPeerId(fullHash: string, peerId: string) {
        let peerIds = this.getPeerIdsByFullHash(fullHash);
        peerIds.push(peerId);
        this.fullHashesWithPeerIds.set(fullHash, peerIds);
    }

    private removePeerId(fullHash: string, peerId: string) {
        let peerIds = this.getPeerIdsByFullHash(fullHash);
        peerIds = peerIds.filter(p => p != peerId);

        if (peerIds.length != 0) {
            this.fullHashesWithPeerIds.set(fullHash, peerIds);
        } else {
            this.fullHashesWithPeerIds.delete(fullHash);
        }
    }
}