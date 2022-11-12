// run with: ts-node index.ts
// run with: config

import {Server} from "socket.io";
import {MediationServer} from "./communication/MediationServer";
import {io} from "socket.io-client";
import {ConnectionType, MediationProtocol} from "../../common/MediationProtocol";

const ms = new MediationServer(new Server(8888, {cors:{origin: '*'}}));
ms.run();

/*
const socket1 = io("ws://localhost:8888");
const socket2 = io("ws://localhost:8888");
const socket3 = io("ws://localhost:8888");

const testHash1 = "test-hash1";

setTimeout(() => { // Timeout because of race condition
    const peer1 = new MediationProtocol(socket1);
    peer1.handshake("Peer1", ConnectionType.MEDIATION);
    peer1.on('established', () => console.log("established Peer1"));
    peer1.on('peers', (fullHash: string, peerList: string[]) => onGetPeers("Peer1", fullHash, peerList));
    peer1.on('signal', (receiverPeerId: string, signalData: string) => console.log("signal " + receiverPeerId + " to Peer1. Data: " + signalData));

    const peer2 = new MediationProtocol(socket2);
    peer2.handshake("Peer2", ConnectionType.MEDIATION);
    peer2.on('established', () => console.log("established Peer2"));
    peer2.on('peers', (fullHash: string, peerList: string[]) => onGetPeers("Peer2", fullHash, peerList));

    const peer3 = new MediationProtocol(socket3);
    peer3.handshake("Peer3", ConnectionType.MEDIATION);
    peer3.on('established', () => console.log("established Peer3"));
    peer3.on('peers', (fullHash: string, peerList: string[]) => onGetPeers("Peer3", fullHash, peerList));

    setTimeout(() => { // Timeout because of race condition
        peer1.announce(testHash1);
        peer1.get_peers(testHash1);

        peer2.announce(testHash1);
        peer2.get_peers(testHash1);

        peer3.announce(testHash1);
        peer3.get_peers(testHash1);

        setTimeout(() => peer2.signal("Peer1", "signal peer2 to peer1"), 100);
        setTimeout(() => peer1.finish(testHash1), 100);
        setTimeout(() => peer3.get_peers(testHash1), 100);
    }, 100);
}, 100);

function onGetPeers(actualPeer: string, fullHash: string, peerList: string[]) {
    console.log("onPeers " + actualPeer + ". FullHash: " + fullHash + ". Peers: " + JSON.stringify(peerList));
} */