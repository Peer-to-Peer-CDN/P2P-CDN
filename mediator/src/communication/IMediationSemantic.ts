import {MediationProtocol} from "../../../common/MediationProtocol";

export interface IMediationSemantic {
    onGetPeers(fullHash: string): void;
    onPeers(fullHash: string): void;
    onSignal(receiverPeerId: string, signalData: string): void;
    onAnnounce(fullHash: string): void;
    onFinish(fullHash: string): void;
    getConnection(): MediationProtocol;
}