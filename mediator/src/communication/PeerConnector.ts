import {ConnectionType, MediationProtocol} from "../../../common/MediationProtocol";
import {IMediationSemantic} from "./IMediationSemantic";

export class PeerConnector implements IMediationSemantic {
    private readonly peerId: string;
    private readonly mediation: MediationProtocol;
    private readonly getConnectionByPeerId: Function;
    private readonly getPeerIdsByFullHash: Function;
    private readonly updatePeerIds: Function;

    constructor(peerId: string, mediation: MediationProtocol, getConnectionByPeerId: Function, getPeerIdsByFullHash: Function, updatePeerIds: Function) {
        this.peerId = peerId;
        this.mediation = mediation;
        this.getConnectionByPeerId = getConnectionByPeerId;
        this.getPeerIdsByFullHash = getPeerIdsByFullHash;
        this.updatePeerIds = updatePeerIds;
    }

    public onGetPeers(fullHash: string) {
        console.log("getting peers (PeerConnector)", fullHash, this.peerId);
        const peerIds = this.getPeerIdsByFullHash(fullHash, ConnectionType.MEDIATION, this.peerId).filter((peerId: string) => peerId != this.peerId);
        this.mediation.peers(fullHash, peerIds);
    }

    public onPeers(fullHash: string, peerList: string[]) {
        // Do nothing, because case 'peer sends list of peers to mediator' is not supported
    }

    public onSignal(fullHash: string, receiverPeerId: string, signalData: string) {
        console.log("received signal for", receiverPeerId, "from", this.peerId);
        const targetMediation = this.getConnectionByPeerId(receiverPeerId);

        if (targetMediation != null) {
            console.log("sending signal to", receiverPeerId, "for ", this.peerId);
            targetMediation.signal(fullHash, this.peerId, signalData);
        }
    }

    public onAnnounce(fullHash: string) {
        console.log("announced", fullHash, this.peerId);
        this.updatePeerIds(fullHash, this.peerId, false);
    }

    public onFinish(fullHash: string) {
        this.updatePeerIds(fullHash, this.peerId, true);
    }

    public getConnection(): MediationProtocol {
        return this.mediation;
    }
}
