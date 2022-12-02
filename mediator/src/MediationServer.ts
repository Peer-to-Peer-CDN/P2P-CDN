import {Server} from "socket.io";
import { IIdentityGenerator } from "../../common/IIdentityGenerator";
import { DefaultIdentityGenerator } from "../../common/DefaultIdentityGenerator";
import { ConnectionType, MediationProtocol} from "../../common/MediationProtocol";
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
        this.router = new MediationRouter(mediationPort, this.dht);
    }

    public run() {
        this.server.on('connection', (socket) => {
            const mediationProtocol = new MediationProtocol(socket);
            mediationProtocol.on('handshake', (peerId, connectionType) => {
                if(connectionType == ConnectionType.MEDIATION) {
                    const peerConnector = new PeerConnector(this.dht, peerId, mediationProtocol, this.router);
                    peerConnector.startListener();
                    this.router.connectionByReceiverId.set(peerId, peerConnector);
                    socket.on('disconnect', () => { this.router.finishPeer(peerId); });
                } else if(connectionType == ConnectionType.REPLICATION) {
                    const mediatorConnector = new MediatorConnector(mediationProtocol, this.router);
                    mediatorConnector.startListener();
                }
                mediationProtocol.established();
            });
        });
    }
}
