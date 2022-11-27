import {Server} from "socket.io";
import { DefaultIdentityGenerator } from "../../common/DefaultIdentityGenerator";
import { DHTNode } from "./DHTNode";
import {ConnectionType, MediationProtocol} from "../../common/MediationProtocol";
import { MediationRouter } from "./MediationRouter";
import { MediatorConnector } from "./MediatorConnector";
import { PeerConnector } from "./PeerConnector";


export class MediationServer {

    private mediatorId;
    constructor(server: Server, DHTBootstrapAddrs: string[] | false, dhtPort:number, mediationPort:number) {
        let DHT = new DHTNode(this.mediatorId, DHTBootstrapAddrs, dhtPort, () => {});
        let dataHolder = new MediationRouter(mediationPort, DHT);
        this.mediatorId = new DefaultIdentityGenerator().generateIdentity();
        server.on('connection', (socket) => {
            let mediationProtocol = new MediationProtocol(socket);
            mediationProtocol.on('handshake', (peerId, connectionType) => {
                if(connectionType == ConnectionType.MEDIATION) {
                    let pc = new PeerConnector(DHT, peerId, mediationProtocol, dataHolder);
                    dataHolder.connectionByReceiverId.set(peerId, pc);
                } else if(connectionType == ConnectionType.REPLICATION) {
                    let mc = new MediatorConnector(mediationProtocol, dataHolder);
                }
                mediationProtocol.established();
            });
        });
    }
}