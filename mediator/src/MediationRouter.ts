import { io } from "socket.io-client";
import { IIdentityGenerator } from "../../common/IIdentityGenerator";
import { DefaultIdentityGenerator } from "../../common/DefaultIdentityGenerator";
import { ConnectionKeyWords, ConnectionType, MediationProtocol } from "../../common/MediationProtocol";
import { DHTNode } from "./DHTNode";
import { PeerConnector } from "./PeerConnector";
import { MediatorConnector } from "./MediatorConnector";

export class MediationRouter {
    private DHT: DHTNode;
    private readonly mediationPort: number;
    private readonly mediatorId: string;
    public readonly connectionByReceiverId = new Map<string, PeerConnector | MediatorConnector>();
    public readonly peerIdByFullHash = new Map<string, string[]>();
    
    private pendingPeerConnectionByFullHash = new Map<string, PeerConnector[]>();
    private mediatorConnectionByAddress = new Map<string, MediatorConnector>();

    constructor(port: number, DHT: DHTNode, identityGenerator?: IIdentityGenerator) {
        this.mediationPort = port;
        this.DHT = DHT;
        this.mediatorId = identityGenerator?.generateIdentity() ?? new DefaultIdentityGenerator().generateIdentity();
    }

    public getRemotePeers(full_hash: string, peerConnector: PeerConnector) {
        this.DHT.find_mediators(full_hash, (hostname, port) => {
            if(hostname === '0.0.0.0') { //this is relevant on same machine connections since this would multiply the amount of connections
                return;
            }
            let mediator = this.mediatorConnectionByAddress.get(hostname + port.toString());
            if(!this.pendingPeerConnectionByFullHash.get(full_hash)) {
                this.pendingPeerConnectionByFullHash.set(full_hash, []);
            }

            this.pendingPeerConnectionByFullHash.get(full_hash)?.push(peerConnector);

            if(!mediator) {
                const socket = io("ws://" + hostname + ":" + port.toString());
                const protocol = new MediationProtocol(socket);
                mediator = new MediatorConnector(protocol, this);
                this.mediatorConnectionByAddress.set(hostname + port.toString(), mediator);
                protocol.handshake(this.mediatorId, ConnectionType.REPLICATION);
                protocol.on(ConnectionKeyWords.ESTABLISHED, () => {
                    protocol.get_peers(full_hash);
                });
            } else {
                mediator.protocol.get_peers(full_hash);
            }
        });
    }
    public routeSignal(full_hash: string, receiverId: string, signalData: string, peerIdOrConnector: string | MediatorConnector) {
        if(receiverId.length === 40) {
            this.routeSignalToPeer(full_hash, receiverId, signalData, peerIdOrConnector as string);
        } else if(receiverId.length === 80) {
            this.routeSignalFromMediator(full_hash, receiverId, signalData, peerIdOrConnector as MediatorConnector);
        }
    }

    private routeSignalToPeer(full_hash: string, receiverId: string, signalData: string, peerId: string) {
        let receiverConnector = this.connectionByReceiverId.get(receiverId);
        let receiverIdOrConcat;
        if(receiverConnector instanceof PeerConnector) {
            receiverIdOrConcat = peerId;
        } else if(receiverConnector instanceof MediatorConnector){
            receiverIdOrConcat = peerId + receiverId;
        } else {
            console.error("connection not found");
            return;
        }

        if(receiverConnector) {
            receiverConnector.protocol.signal(full_hash, receiverIdOrConcat, signalData);
        } else {
            console.error("Could not find connection to signal to");
        }
    }

    private routeSignalFromMediator(full_hash: string, concatPeerId: string, signalData: string, mediatorConnector: MediatorConnector) {
        let senderId = concatPeerId.slice(0,40);
        let receiverId = concatPeerId.slice(40,80);
        this.connectionByReceiverId.set(senderId, mediatorConnector);
        let peerConnector = this.connectionByReceiverId.get(receiverId);
        if(peerConnector && peerConnector instanceof PeerConnector) {
            peerConnector.protocol.signal(full_hash, senderId, signalData);
        } else {
            console.error("Could not find a peer to signal to");
        }
    }

    public announce(full_hash: string, peerId: string) {
        if(!this.peerIdByFullHash.get(full_hash)) {
            this.peerIdByFullHash.set(full_hash, []);
        }
    
        this.DHT.announce(full_hash, this.mediationPort);
        this.peerIdByFullHash.get(full_hash)?.push(peerId);
    }

    public getPeerIdsByFullHash(full_hash: string) {
        return this.peerIdByFullHash.get(full_hash);
    }

    public routePeersToPeer(full_hash: string, peerList: string[], mediatorConnector: MediatorConnector) {
        if(!this.peerIdByFullHash.get(full_hash)) {
            this.peerIdByFullHash.set(full_hash, []);
        }
        peerList.forEach(peer => {
            if(!this.peerIdByFullHash.get(full_hash)) {
                this.peerIdByFullHash.get(full_hash)?.push(peer);
            }
            this.connectionByReceiverId.set(peer, mediatorConnector);
        });
        let pendingPeers = this.pendingPeerConnectionByFullHash.get(full_hash);
        if(pendingPeers) {
            pendingPeers.forEach(peerConnector => {
                peerConnector.protocol.peers(full_hash, peerList);
            });
        }
    }
    public finishPeer(peerId: string) {
        let connection = this.connectionByReceiverId.get(peerId) as PeerConnector;
        if(connection) {
            this.connectionByReceiverId.delete(peerId);
            connection.knownHashesSet?.forEach(value => {
                this.peerIdByFullHash.set(value, this.peerIdByFullHash.get(value)?.filter(e => e!== peerId) || []);
            });
        }
    }
}