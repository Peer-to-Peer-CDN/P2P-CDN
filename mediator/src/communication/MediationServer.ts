import {Server} from "socket.io";
import {ConnectionType, MediationProtocol} from "../../../common/MediationProtocol";
import {IIdentityGenerator} from "../../../common/IIdentityGenerator";
import {DefaultIdentityGenerator} from "../../../common/DefaultIdentityGenerator";
import {PeerConnector} from "./PeerConnector";
import {IMediationSemantic} from "./IMediationSemantic";
import {MediationReplicator} from "./MediationReplicator";

export class MediationServer {
    private readonly mediatorId: string;
    private server: Server;
    private mediationReplicator: MediationReplicator;
    private fullHashesWithPeerIds: Map<string, string[]> = new Map(); // fullHash, peerIds
    private peerConnectorsWithId: Map<string, IMediationSemantic> = new Map(); // id, PeerConnector

    constructor(server: Server, identityGenerator?: IIdentityGenerator) {
        this.server = server;
        this.mediationReplicator = new MediationReplicator(
            (...args: any[]) => this.getPeerIdsByFullHash.apply(this, args),
            (...args: any[]) => this.getConnectionByPeerId.apply(this, args));
        this.mediatorId = identityGenerator?.generateIdentity() ?? new DefaultIdentityGenerator().generateIdentity();
    }

    public run() {
        this.server.on('connection', (socket) => {
            const mediation = new MediationProtocol(socket);

            mediation.on('handshake', (id, connectionType) => {
                let semantic: IMediationSemantic;

                if (connectionType == ConnectionType.MEDIATION) {
                    semantic = new PeerConnector(
                        id,
                        mediation,
                        (...args: any[]) => this.getConnectionByPeerId.apply(this, args),
                        (...args: any[]) => this.getPeerIdsByFullHash.apply(this, args),
                        (...args: any[]) => this.updatePeerIds.apply(this, args),
                        (...args: any[]) => this.signalOverMediatorConnection.apply(this, args));
                    this.peerConnectorsWithId.set(id, semantic);
                } else if (connectionType == ConnectionType.REPLICATION) {
                    semantic = this.mediationReplicator.createMediationConnector(mediation);
                    console.log("connection replication " + id + " on mediator " + this.mediatorId);
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
                    this.peerConnectorsWithId.delete(id);
                });
            });
        });
    }

    private getPeerIdsByFullHash(fullHash: string, connectionType?: ConnectionType, initiatorPeerId?: string): string[] {
        const peerIds = this.fullHashesWithPeerIds.get(fullHash);

        if (peerIds == null && connectionType == ConnectionType.MEDIATION && initiatorPeerId) {
            console.log("now getting peers via m2");
            this.mediationReplicator.getPeersFromOtherMediator(fullHash, this.mediatorId, initiatorPeerId); // Callback
        }

        return peerIds == null ? [] : peerIds;
    }

    private getConnectionByPeerId(peerId: string): MediationProtocol | undefined {
        const peerConnector = this.peerConnectorsWithId.get(peerId);
        if (peerConnector != null) {
            return peerConnector.getConnection();
        } else {
            return undefined;
        }
    }

    private signalOverMediatorConnection(fullHash: string, concatenatedPeerId: string, signalData: string) {
        this.mediationReplicator.signalOverMediatorConnection(fullHash, concatenatedPeerId, signalData);
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
        // TODO: DHT_announce(peerId, fullHash);
    }

    private removePeerId(fullHash: string, peerId: string) {
        let peerIds = this.getPeerIdsByFullHash(fullHash);
        peerIds = peerIds.filter(p => p != peerId);

        if (peerIds.length != 0) {
            this.fullHashesWithPeerIds.set(fullHash, peerIds);
        } else {
            this.fullHashesWithPeerIds.delete(fullHash);
            // TODO: DHT_finish(peerId, fullHash);
        }
    }
}