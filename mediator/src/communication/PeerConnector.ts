import {MediationProtocol} from "../../../common/MediationProtocol";

export class PeerConnector {
    private readonly mediation: MediationProtocol;
    private peerId: string;

    constructor(peerId: string, mediation: MediationProtocol) {
        this.peerId = peerId;
        this.mediation = mediation;
    }

    public getMediation(): MediationProtocol {
        return this.mediation;
    }
}