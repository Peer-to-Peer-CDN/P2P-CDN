import { ConnectionKeyWords, MediationProtocol } from "../../common/MediationProtocol";
import { IConnectorBase } from "./IConnectorBase";
import { MediationRouter } from "./MediationRouter";

export class MediatorConnector implements IConnectorBase {
    public readonly protocol: MediationProtocol;
    private readonly dataHolder: MediationRouter;

    constructor(protocol: MediationProtocol, router: MediationRouter) {
        this.protocol = protocol;
        this.dataHolder = router;
    }

    public startListener() {
        this.protocol.on(ConnectionKeyWords.GET_PEERS, (full_hash: string) => {
            let peers = this.dataHolder.getPeerIdsByFullHash(full_hash);
            if(peers) {
                this.protocol.peers(full_hash, peers);
            }
        });

        this.protocol.on(ConnectionKeyWords.SIGNAL, (full_hash:string, concatPeerId: string, signalData: string) => {
            this.dataHolder.routeSignal(full_hash, concatPeerId, signalData, this);
        });

        this.protocol.on(ConnectionKeyWords.PEERS, (full_hash:string, peerList: string[]) => {
            this.dataHolder.routePeersToPeer(full_hash, peerList, this);
        });

        this.protocol.on(ConnectionKeyWords.ANNOUNCE, (full_hash: string) => {
            console.warn("mediator tried to announce, which makes no sense");
        });

        this.protocol.on(ConnectionKeyWords.FINISH, (full_hash: string) => {
            console.warn("mediator tried to finish, which makes no sense");
        });
    }
}