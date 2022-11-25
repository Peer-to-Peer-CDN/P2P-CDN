import {IMediationSemantic} from "./IMediationSemantic";
import {ConnectionType, MediationProtocol} from "../../../common/MediationProtocol";
import {io} from "socket.io-client";
import {MediatorAddress} from "../common/MediatorAddress";
import {MediationConnector} from "./MediationConnector";

export class MediationReplicator {
    private readonly getPeerIdsByFullHash: Function;

    constructor(getPeerIdsByFullHash: Function) { // TODO: Add getConnectionByPeerId
        this.getPeerIdsByFullHash = getPeerIdsByFullHash;
    }

    public createMediationConnector(id: string, mediation: MediationProtocol) : IMediationSemantic {
        return new MediationConnector(id, mediation, this.getPeerIdsByFullHash);
    }

    public getPeersFromOtherMediator(fullHash: string, initiatorId: string, initiatorMediation: MediationProtocol): void {
        const mediatorAddress = this.getMediatorAddressFromDht(fullHash);
        const socket = io("ws://" + mediatorAddress.url);
        const mediation = new MediationProtocol(socket);
        const semantic = new MediationConnector(initiatorId, mediation, this.getPeerIdsByFullHash, initiatorMediation)

        mediation.handshake(initiatorId, ConnectionType.REPLICATION);

        mediation.on("established", () => {
            mediation.get_peers(fullHash);
            mediation.on('peers', (...args) => semantic.onPeers.apply(semantic, args));
            mediation.on('signal', (...args) => semantic.onSignal.apply(semantic, args));
        });
    }

    private getMediatorAddressFromDht(fullHash: string): MediatorAddress {
        // TODO: const mediatorAddress = DHT_get(fullHash);
        return new MediatorAddress("localhost", 8889);
    }
}