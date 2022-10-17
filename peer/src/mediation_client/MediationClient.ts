import {PeerIdentifier} from "../common/PeerIdentifier";
import SimplePeer from "simple-peer";
import { IP2PTransport } from "../communication/IP2PTransport";
import { IMediationClient, MediationEventHandler } from "./IMediationClient";


export class MediationClient implements IMediationClient{
    add_peer_event_handlers = new Map<string, MediationEventHandler>(); //full_hash => peer_event_handler()
    constructor() {}

    register(full_hash: string, event_handler: MediationEventHandler) : void {
        this.add_peer_event_handlers.set(full_hash, event_handler);
    }
}
