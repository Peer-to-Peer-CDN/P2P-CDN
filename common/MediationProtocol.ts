import {IClientServerTransport} from "./IClientServerTransport";

export type MediationEventCallback = (...args: any[]) => void;

export enum ConnectionType {
    MEDIATION,
    REPLICATION
}

export enum ConnectionKeyWords {
    CONNECTION = "connection",
    DISCONNECT = "disconnect",
    HANDSHAKE = "handshake",
    ESTABLISHED = "established",
    GET_PEERS = "get_peers",
    PEERS = "peers",
    SIGNAL = "signal",
    ANNOUNCE = "announce",
    FINISH = "finish"
}

export class MediationProtocol {
    private stream: IClientServerTransport;
    protected listeners: Map<string, MediationEventCallback[]>;

    constructor(stream: IClientServerTransport) {
        this.stream = stream;
        this.listeners = new Map<string, MediationEventCallback[]>();

        stream.on(ConnectionKeyWords.HANDSHAKE, (...args: any[]) => this.listeners.get(ConnectionKeyWords.HANDSHAKE)?.forEach((callback) => callback(...args)));
        stream.on(ConnectionKeyWords.ESTABLISHED, (...args: any[]) => this.listeners.get(ConnectionKeyWords.ESTABLISHED)?.forEach((callback) => callback(...args)));
        stream.on(ConnectionKeyWords.GET_PEERS, (...args: any[]) => this.listeners.get(ConnectionKeyWords.GET_PEERS)?.forEach((callback) => callback(...args)));
        stream.on(ConnectionKeyWords.PEERS, (...args: any[]) => this.listeners.get(ConnectionKeyWords.PEERS)?.forEach((callback) => callback(...args)));
        stream.on(ConnectionKeyWords.SIGNAL, (...args: any[]) => this.listeners.get(ConnectionKeyWords.SIGNAL)?.forEach((callback) => callback(...args)));
        stream.on(ConnectionKeyWords.ANNOUNCE, (...args: any[]) => this.listeners.get(ConnectionKeyWords.ANNOUNCE)?.forEach((callback) => callback(...args)));
        stream.on(ConnectionKeyWords.FINISH, (...args: any[]) => this.listeners.get(ConnectionKeyWords.FINISH)?.forEach((callback) => callback(...args)));
    }

    on(event: string, callback: MediationEventCallback) {
        if (!this.listeners.get(event)) {
            this.listeners.set(event, []);
        }

        this.listeners.get(event)?.push(callback);
    }

    public handshake(peerId: string, connectionType: ConnectionType) {
        this.stream.emit(ConnectionKeyWords.HANDSHAKE, peerId, connectionType);
    }

    public established() {
        this.stream.emit(ConnectionKeyWords.ESTABLISHED);
    }

    public get_peers(fullHash: string) {
        this.stream.emit(ConnectionKeyWords.GET_PEERS, fullHash);
    }

    public peers(fullHash: string, peerList: string[]) {
        this.stream.emit(ConnectionKeyWords.PEERS, fullHash, peerList);
    }

    public signal(fullHash: string, receiverPeerId: string, signalData: string) {
        this.stream.emit(ConnectionKeyWords.SIGNAL, fullHash, receiverPeerId, signalData);
    }

    public announce(fullHash: string) {
        this.stream.emit(ConnectionKeyWords.ANNOUNCE, fullHash);
    }

    public finish(fullHash: string) {
        this.stream.emit(ConnectionKeyWords.FINISH, fullHash);
    }
}
