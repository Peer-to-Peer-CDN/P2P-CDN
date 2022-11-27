import { ConnectionType, MediationProtocol } from "../../common/MediationProtocol";
import {DHTNode} from "./DHTNode";
import { MediationRouter } from "./MediationRouter";

export class PeerConnector {
    public readonly protocol: MediationProtocol;
    private readonly MINIMUM_PEER_AMOUNT_THRESHHOLD = 1;
    private DHT: DHTNode;
    private dataHolder : MediationRouter;
    private peerId: string;

    constructor(DHT:DHTNode ,peerId: string,protocol: MediationProtocol, router: MediationRouter) {
        this.peerId = peerId;
        this.DHT = DHT;
        this.dataHolder = router;
        this.protocol = protocol;
        protocol.on('get_peers', (full_hash: string) => {
            let localPeers = router.peerIdByFullHash.get(full_hash);
            if(localPeers) {
                protocol.peers(full_hash, localPeers!);
            } 
            if(localPeers?.length || 0 < this.MINIMUM_PEER_AMOUNT_THRESHHOLD) {
                router.getRemotePeers(full_hash, this);
            }
            
        });
        protocol.on('signal', (full_hash:string, receiverPeerId: string, signalData: string) => {
            router.routeSignal(full_hash, receiverPeerId, signalData, peerId);
        });
        protocol.on('peers', (full_hash:string, peerList: string[]) => {
            console.warn("peer tried to send peerlist, which makes no sense");
        });
        protocol.on('announce', (full_hash:string) => {
            router.announce(full_hash, peerId);
        });

        protocol.on('finish', (full_hash: string) => {
            //TODO implement
        });
    }

}