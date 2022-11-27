import { MediationProtocol } from "../../common/MediationProtocol";
import { MediationRouter } from "./MediationRouter";


export class MediatorConnector {
    public readonly protocol: MediationProtocol;
    private readonly dataHolder: MediationRouter;

    constructor(protocol: MediationProtocol, dataHolder: MediationRouter) {
        this.protocol = protocol;
        this.dataHolder = dataHolder;
        protocol.on('get_peers', (full_hash: string) => {
            let peers = dataHolder.getPeerIdsByFullHash(full_hash);
            if(peers) {
                protocol.peers(full_hash, peers);
            }
        });
        protocol.on('signal', (full_hash:string, concatPeerId: string, signalData: string) => {
            dataHolder.routeSignal(full_hash, concatPeerId, signalData, this);
        });
        protocol.on('peers', (full_hash:string, peerList: string[]) => {
            dataHolder.routePeersToPeer(full_hash, peerList, this);
        });
        protocol.on('announce', (full_hash:string) => {
            console.warn("mediator tried to announce, which makes no sense");
        });
        protocol.on('finish', (full_hash: string) => {
            console.warn("mediator tried to finish, which makes no sense");
        });
    }
}