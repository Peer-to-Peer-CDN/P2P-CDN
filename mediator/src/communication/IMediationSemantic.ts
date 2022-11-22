import {MediationProtocol} from "../../../common/MediationProtocol";

export interface IMediationSemantic {
    onGetPeers(fullHash: string): void;
    onPeers(fullHash: string, peerList: string[]): void;
    onSignal(fullHash: string, receiverPeerId: string, signalData: string): void;
    onAnnounce(fullHash: string): void;
    onFinish(fullHash: string): void;
    getConnection(): MediationProtocol;
}