import { PeerWireFactory } from "../swarm/SwarmManager";

export type MediationEventHandler = (peerWireFactory: PeerWireFactory) => void;

export interface IMediationClient {
    registerForPeers(full_hash: string, event_handler: MediationEventHandler) : void;
    announce(full_hash: string) : void;
    requestPeers(full_hash: string) : void;
}