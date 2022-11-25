import {IMediationSemantic} from "./IMediationSemantic";
import {ConnectionType, MediationProtocol} from "../../../common/MediationProtocol";
import {io} from "socket.io-client";
import {MediatorAddress} from "../common/MediatorAddress";
import {MediationConnector} from "./MediationConnector";

export class MediationReplicator {
    private readonly getPeerIdsByFullHash: Function;
    private readonly getConnectionByPeerId: Function;
    private fullHashesWithMediationConnector: Map<string, IMediationSemantic> = new Map(); // fullHash, MediationConnector

    constructor(getPeerIdsByFullHash: Function, getConnectionByPeerId: Function) {
        this.getPeerIdsByFullHash = getPeerIdsByFullHash;
        this.getConnectionByPeerId = getConnectionByPeerId;
    }

    public createMediationConnector(mediation: MediationProtocol) : IMediationSemantic {
        return new MediationConnector(mediation, this.getPeerIdsByFullHash, this.getConnectionByPeerId);
    }

    public getPeersFromOtherMediator(fullHash: string, mediatorId: string, initiatorPeerId: string): void {
        const mediatorAddress = this.getMediatorAddressFromDht(fullHash);
        const socket = io("ws://" + mediatorAddress.url);
        const mediation = new MediationProtocol(socket);
        const semantic = new MediationConnector(mediation, this.getPeerIdsByFullHash, this.getConnectionByPeerId, initiatorPeerId)
        this.fullHashesWithMediationConnector.set(fullHash, semantic);

        mediation.handshake(mediatorId, ConnectionType.REPLICATION);

        mediation.on("established", () => {
            mediation.get_peers(fullHash);
            mediation.on('peers', (...args) => semantic.onPeers.apply(semantic, args));
            mediation.on('signal', (...args) => semantic.onSignal.apply(semantic, args));
        });
    }

    public signalOverMediatorConnection(fullHash: string, receiverPeerId: string, signalData: string) {
        const semantic = this.fullHashesWithMediationConnector.get(fullHash);

        if (semantic) {
            semantic.getConnection().signal(fullHash, receiverPeerId, signalData);
        }
    }

    private getMediatorAddressFromDht(fullHash: string): MediatorAddress {
        // TODO: const mediatorAddress = DHT_get(fullHash);
        return new MediatorAddress("localhost", 8889);
    }
}