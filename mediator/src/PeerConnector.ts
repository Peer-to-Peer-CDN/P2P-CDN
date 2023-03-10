import { ConnectionKeyWords, MediationProtocol } from "../../common/MediationProtocol";
import {DHTNode} from "./DHTNode";
import { IConnectorBase } from "./IConnectorBase";
import { MediationRouter } from "./MediationRouter";

export class PeerConnector implements IConnectorBase {
    public readonly protocol: MediationProtocol;
    public readonly knownHashesSet = new Set<string>();

    private readonly MINIMUM_PEER_AMOUNT_THRESHOLD = 1;
    private DHT: DHTNode;
    private dataHolder : MediationRouter;
    private readonly peerId: string;

    constructor(DHT: DHTNode, peerId: string,protocol: MediationProtocol, router: MediationRouter) {
        this.peerId = peerId;
        this.DHT = DHT;
        this.dataHolder = router;
        this.protocol = protocol;
    }

    public startListener() {
        this.protocol.on(ConnectionKeyWords.GET_PEERS, (full_hash: string) => {
            this.knownHashesSet.add(full_hash);
            let localPeers = this.dataHolder.peerIdByFullHash.get(full_hash)?.filter(p => p !== this.peerId);
            if(localPeers) {
                this.protocol.peers(full_hash, localPeers!);
            }

            if(!localPeers || localPeers?.length < this.MINIMUM_PEER_AMOUNT_THRESHOLD) {
                this.dataHolder.getRemotePeers(full_hash, this);
            }
        });

        this.protocol.on(ConnectionKeyWords.SIGNAL, (full_hash:string, receiverPeerId: string, signalData: string) => {
            this.dataHolder.routeSignal(full_hash, receiverPeerId, signalData, this.peerId);
        });

        this.protocol.on(ConnectionKeyWords.PEERS, (full_hash:string, peerList: string[]) => {
            console.warn("peer tried to send peerlist, which makes no sense");
        });

        this.protocol.on(ConnectionKeyWords.ANNOUNCE, (full_hash:string) => {
            this.dataHolder.announce(full_hash, this.peerId);
        });

        this.protocol.on(ConnectionKeyWords.FINISH, (full_hash: string) => {
            this.dataHolder.finishPeer(this.peerId);
        });
    }
}