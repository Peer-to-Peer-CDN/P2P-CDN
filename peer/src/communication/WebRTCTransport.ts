import SimplePeer from "simple-peer";
import {IP2PTransport, PeerEventCallback} from "./IP2PTransport";


export class WebRTCTransport implements IP2PTransport {
    private webrtc_instance : SimplePeer.Instance; 
    constructor() {
        this.webrtc_instance = new SimplePeer();
        this.webrtc_instance.pipe
    } 
    pipe(destination : any) : any {
        return this.webrtc_instance.pipe(destination);
    }
    on(event_type : string, callback : PeerEventCallback) : void{
        this.webrtc_instance.on(event_type, callback);
    }
    signal(data: any) : void {
        this.webrtc_instance.signal(data);
    }
}