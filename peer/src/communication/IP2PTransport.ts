

export type PeerEventCallback = (...args: any[]) => void;

export interface IP2PTransport {

    pipe(destination: any) : any; 
    on(event_type: string, callback: PeerEventCallback) : void;
    signal(data: any) : void;

}