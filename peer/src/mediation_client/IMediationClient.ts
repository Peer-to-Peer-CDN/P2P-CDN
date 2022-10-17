
export type MediationEventHandler = (id: PeerIdentifier, rtc: IP2PTransport, init: boolean) => void;

export interface IMediationClient {
    register(full_hash: string, event_handler: MediationEventHandler) : void;
}