import {Server} from "socket.io";
import { IIdentityGenerator } from "../../common/IIdentityGenerator";
import { DefaultIdentityGenerator } from "../../common/DefaultIdentityGenerator";
import {ConnectionKeyWords, ConnectionType, MediationProtocol} from "../../common/MediationProtocol";
import { DHTNode } from "./DHTNode";
import { PeerConnector } from "./PeerConnector";
import { MediationRouter } from "./MediationRouter";
import { MediatorConnector } from "./MediatorConnector";

export class MediationServer {
    private readonly server: Server;
    private readonly mediatorId: string;
    private readonly dht: DHTNode;
    private readonly router: MediationRouter;

    constructor(server: Server, dhtBootstrapAddress: string[] | false, dhtPort: number, mediationPort: number, identityGenerator?: IIdentityGenerator) {
        this.server = server;
        this.mediatorId = identityGenerator?.generateIdentity() ?? new DefaultIdentityGenerator().generateIdentity();
        this.dht = new DHTNode(this.mediatorId, dhtBootstrapAddress, dhtPort, () => {});
        this.router = new MediationRouter(mediationPort, this.dht, this.mediatorId);
    }

    public run() {
        this.server.on(ConnectionKeyWords.CONNECTION, (socket) => {
            const mediationProtocol = new MediationProtocol(socket);
            mediationProtocol.on(ConnectionKeyWords.HANDSHAKE, (id, connectionType) => {
                if (id == null) {
                    console.warn("Id is not set. No handshake possible. Connection type: ", connectionType);
                    return;
                }

                if(connectionType == ConnectionType.MEDIATION) {
                    const peerConnector = new PeerConnector(this.dht, id, mediationProtocol, this.router);
                    peerConnector.startListener();
                    this.router.connectionByReceiverId.set(id, peerConnector);
                    socket.on(ConnectionKeyWords.DISCONNECT, () => { this.router.finishPeer(id); });
                } else if(connectionType == ConnectionType.REPLICATION) {
                    if (this.mediatorId == id) {
                        console.warn("Connecting mediator to itself is not possible. Mediator-ID: ", this.mediatorId);
                        return;
                    }
                    const mediatorConnector = new MediatorConnector(mediationProtocol, this.router);
                    socket.on(ConnectionKeyWords.DISCONNECT, () => {this.router.finishMediatorSeeking(id); });
                    mediatorConnector.startListener();
                }
                mediationProtocol.established();
            });
        });
    }
}
