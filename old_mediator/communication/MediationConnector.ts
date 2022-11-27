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
        console.log("onPeers (MediationConnector)", fullHash);
        const targetMediation = this.getConnectionByPeerId(this.initiatorPeerId);
        targetMediation.peers(fullHash, peerList);
    }

    onSignal(fullHash: string, concatenatedPeerId: string, signalData: string): void {
        const initiatorPeerId = concatenatedPeerId.slice(0, 40);
        const receiverPeerId = concatenatedPeerId.slice(40, 80);
        const targetMediation = this.getConnectionByPeerId(receiverPeerId);
        console.log("onSignal (MediationConnector)", fullHash, initiatorPeerId, receiverPeerId);
        console.log("mediation is:", !!targetMediation, "trying to get", receiverPeerId);
        targetMediation.signal(fullHash, initiatorPeerId, signalData);
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