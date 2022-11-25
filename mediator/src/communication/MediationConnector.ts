import {MediationProtocol} from "../../../common/MediationProtocol";
import {IMediationSemantic} from "./IMediationSemantic";

export class MediationConnector implements IMediationSemantic {
    private readonly mediation: MediationProtocol;
    private readonly initiatorPeerId: string;
    private readonly getPeerIdsByFullHash: Function;
    private readonly getConnectionByPeerId: Function;

    constructor(mediation: MediationProtocol, getPeerIdsByFullHash: Function, getConnectionByPeerId: Function, initiatorPeerId?: string) {
        this.mediation = mediation;
        this.getPeerIdsByFullHash = getPeerIdsByFullHash;
        this.getConnectionByPeerId = getConnectionByPeerId;
        this.initiatorPeerId = initiatorPeerId ?? "";
    }

    onGetPeers(fullHash: string): void {
        const peerIds = this.getPeerIdsByFullHash(fullHash);
        console.log("onGetPeers (MediationConnector)", fullHash, peerIds);
        this.mediation.peers(fullHash, peerIds);
    }

    onPeers(fullHash: string, peerList: string[]): void {
        console.log("onPeers (MediationConnector)", fullHash, peerList);
        const targetMediation = this.getConnectionByPeerId(this.initiatorPeerId);
        targetMediation.peers(fullHash, peerList);
    }

    onSignal(fullHash: string, receiverPeerId: string, signalData: string): void {
        const concatenatedPeerId = this.initiatorPeerId + receiverPeerId; // TODO: Test (Peer-ID A + Peer-ID B)
        this.mediation.signal(fullHash, concatenatedPeerId, signalData); // TODO: Load target mediation
    }

    onAnnounce(fullHash: string): void {
        // Do nothing, because case 'mediation sends announce' is not supported
    }

    onFinish(fullHash: string): void {
        // Do nothing, because case 'mediation sends announce' is not supported
    }

    getConnection(): MediationProtocol {
        return this.mediation;
    }

}