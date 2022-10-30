export type PeerEventCallback = (...args: any[]) => void;

export interface IP2PTransport {

    pipe(destination: any) : any; 
    on(event_type: string, callback: PeerEventCallback) : any;
    signal(data: any) : void;
    destroy() : void;

}