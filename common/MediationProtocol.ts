import {IClientServerTransport} from "./IClientServerTransport";

export type MediationEventCallback = (...args: any[]) => void;

export class MediationProtocol {
    private stream: IClientServerTransport;
    protected listeners: Map<string, MediationEventCallback[]>;

    constructor(stream: IClientServerTransport) {
        this.stream = stream;
        this.listeners = new Map<string, MediationEventCallback[]>();

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

    public get_peers(fullHash: string) {
        this.stream.emit('get_peers', fullHash);
    }

    public peers(fullHash: string, peerList: string[]) {
        this.stream.emit('peers', fullHash, peerList);
    }

    public signal(full_hash:string, senderPeerId: string, receiverPeerId: string, signalData: string) {
        this.stream.emit('signal',full_hash, senderPeerId, receiverPeerId, signalData);
    }

    public announce(seederPeerId: string, fullHash: string) {
        this.stream.emit('announce', seederPeerId, fullHash);
    }

    public finish(seederPeerId: string, fullHash: string) {
        this.stream.emit('finish', seederPeerId, fullHash);
    }
}
