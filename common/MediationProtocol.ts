import {IClientServerTransport} from "./IClientServerTransport";

export type MediationEventCallback = (...args: any[]) => void;

export enum ConnectionType {
    MEDIATION,
    REPLICATION
}

export class MediationProtocol {
    private stream: IClientServerTransport;
    protected listeners: Map<string, MediationEventCallback[]>;

    constructor(stream: IClientServerTransport) {
        this.stream = stream;
        this.listeners = new Map<string, MediationEventCallback[]>();

        stream.on('handshake', (...args: any[]) => this.listeners.get('handshake')?.forEach((callback) => callback(...args)));
        stream.on('established', (...args: any[]) => this.listeners.get('established')?.forEach((callback) => callback(...args)));
        stream.on('get_peers', (...args: any[]) => this.listeners.get('get_peers')?.forEach((callback) => callback(...args)));
        stream.on('peers', (...args: any[]) => this.listeners.get('peers')?.forEach((callback) => callback(...args)));
        stream.on('signal', (...args: any[]) => this.listeners.get('signal')?.forEach((callback) => callback(...args)));
        stream.on('announce', (...args: any[]) => this.listeners.get('announce')?.forEach((callback) => callback(...args)));
        stream.on('finish', (...args: any[]) => this.listeners.get('finish')?.forEach((callback) => callback(...args)));
    }

    on(event: string, callback: MediationEventCallback) {
        if (!this.listeners.get(event)) {
            this.listeners.set(event, []);
        }

        this.listeners.get(event)?.push(callback);
    }

    public handshake(peerId: string, connectionType: ConnectionType) {
        this.stream.emit('handshake', peerId, connectionType);
    }

    public established() {
        this.stream.emit('established');
    }

    public get_peers(fullHash: string) {
        this.stream.emit('get_peers', fullHash);
    }

    public peers(fullHash: string, peerList: string[]) {
        this.stream.emit('peers', fullHash, peerList);
    }

    public signal(full_hash: string, receiverPeerId: string, signalData: string) {
        this.stream.emit('signal',full_hash, receiverPeerId, signalData);
    }

    public announce(fullHash: string) {
        this.stream.emit('announce', fullHash);
    }

    public finish(fullHash: string) {
        this.stream.emit('finish', fullHash);
    }
}
