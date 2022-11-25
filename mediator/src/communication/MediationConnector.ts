import {MediationProtocol} from "../../../common/MediationProtocol";
import {IMediationSemantic} from "./IMediationSemantic";

export class MediationConnector implements IMediationSemantic {
    private readonly mediatorId: string;
    private readonly mediation: MediationProtocol;
    private readonly getPeerIdsByFullHash: Function;
    private readonly initiatorMediation: MediationProtocol | undefined;

    constructor(mediatorId: string, mediation: MediationProtocol, getPeerIdsByFullHash: Function, initiatorMediation?: MediationProtocol) {
        this.mediatorId = mediatorId; // TODO: Remove
        this.mediation = mediation;
        this.getPeerIdsByFullHash = getPeerIdsByFullHash;
        this.initiatorMediation = initiatorMediation; // TODO: Use initiator peer-id instead of initiator mediation
    }

    onGetPeers(fullHash: string): void {
        const peerIds = this.getPeerIdsByFullHash(fullHash);
        console.log("onGetPeers (MediationConnector)", fullHash, this.mediatorId, peerIds);
        this.mediation.peers(fullHash, peerIds);
    }

    onPeers(fullHash: string, peerList: string[]): void {
        console.log("onPeers (MediationConnector)", fullHash, peerList, this.mediatorId);
        if (this.initiatorMediation) {
            this.initiatorMediation.peers(fullHash, peerList);
        }
    }

    onSignal(fullHash: string, receiverPeerId: string, signalData: string): void {
        const concatenatedPeerId = this.mediatorId + receiverPeerId; // TODO: Peer-ID A + Peer-ID B
        this.mediation.signal(fullHash, concatenatedPeerId, signalData);
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