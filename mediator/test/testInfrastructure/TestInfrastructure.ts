import {Server} from "socket.io";
import {io} from "socket.io-client";
import {ConnectionKeyWords, MediationProtocol} from "../../../common/MediationProtocol";
import {MediationServer} from "../../src/MediationServer";
import {TestIdentityGenerator} from "./TestIdentityGenerator";

export class TestInfrastructure {
    private readonly mediator1: MediationServer;

    public readonly testHash = "test-hash";
    public peer1: MediationProtocol;
    public peerId1: string;
    public peer2: MediationProtocol;
    public peerId2: string;
    public isEstablished1 = false;
    public isEstablished2 = false;
    public fullHashWithPeerList: Map<string, string[]> = new Map();
    public receivedSignalOnPeer1: string;
    public receivedSignalOnPeer2: string;

    constructor() {
        const identityGenerator = new TestIdentityGenerator();
        this.mediator1 = new MediationServer(new Server(8888, {cors: {origin: '*'}}), false, 5555, 8888);
        this.mediator1.run();

        setTimeout(() => { // Timeout to allow mediator to start.
            const socket1 = io("ws://localhost:8888");
            this.peer1 = new MediationProtocol(socket1);
            this.peerId1 = identityGenerator.generateIdentity(1);

            const socket2 = io("ws://localhost:8888");
            this.peer2 = new MediationProtocol(socket2);
            this.peerId2 = identityGenerator.generateIdentity(2);

            this.peer1.on(ConnectionKeyWords.ESTABLISHED, () => {
                this.isEstablished1 = true;
                this.peer1.on(ConnectionKeyWords.PEERS, (full_hash, peer_list) => { this.fullHashWithPeerList.set(full_hash, peer_list); });
                this.peer1.on(ConnectionKeyWords.SIGNAL, (full_hash, peer_id, signal_data) => {
                    this.receivedSignalOnPeer1 = "Received signal on peer1. Full_hash: " + full_hash + ", sender peer_id: " + peer_id + ", signal_data: " + signal_data;
                });
            });

            this.peer2.on(ConnectionKeyWords.ESTABLISHED, () => {
                this.isEstablished2 = true;
                this.peer2.on(ConnectionKeyWords.PEERS, (full_hash, peer_list) => { this.fullHashWithPeerList.set(full_hash, peer_list); });
                this.peer2.on(ConnectionKeyWords.SIGNAL, (full_hash, peer_id, signal_data) => {
                    this.receivedSignalOnPeer2 = "Received signal on peer2. Full_hash: " + full_hash + ", sender peer_id: " + peer_id + ", signal_data: " + signal_data;
                });
            });
        }, 50);
    }
}