import { PeerIdentifier } from "../common/PeerIdentifier";
import { IP2PTransport } from "../transport_layer/IP2PTransport";
import { PeerWireFactory } from "./SwarmManager";

export type MediationEventHandler = (peerWireFactory: PeerWireFactory) => void;

export interface IMediationClient {
    requestPeers(full_hash: string, event_handler: MediationEventHandler) : void;
}