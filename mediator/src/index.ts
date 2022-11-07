// run with: ts-node index.ts

import {Server} from "socket.io";
import {MediationServer} from "./communication/MediationServer";

const ms = new MediationServer(new Server(8888));
ms.run();



import {io} from "socket.io-client";
import {MediationProtocol} from "../../common/MediationProtocol";

const socket1 = io("ws://localhost:8888");
const socket2 = io("ws://localhost:8888");

setTimeout(() => {
    let m1 = new MediationProtocol(socket1);

    m1.print();
    m1.on('peers', (fullHash: string, peerList: string[]) => {
        console.log(fullHash);
        peerList.forEach(p => console.log(p));
    });
    //m1.get_peers("test m1", "0");

    let m2 = new MediationProtocol(socket2);
    //m2.get_peers("test m2");

    //TODO: this is not shared???
    m1.announce("0", "asdf");
    m2.get_peers("asdf", "0");

    //m2.signal("asdf", "1", "0", "signalData m1");
}, 100);














/*
import {MediationProtocol} from "../../common/MediationProtocol";
import {Server} from "socket.io";

const io1 = new Server(8888);
io1.on('connection', (socket) => {
    let m1 = new MediationProtocol(socket);
    m1.on('get_peers', (full_hash:string) => {
        m1.peers(full_hash, ["aa", "bb", "cc"]);
    });
});

import {io} from "socket.io-client";
const socket = io("ws://localhost:8888");
let m2 = new MediationProtocol(socket);
m2.on('peers', (fullHash: string, peerList: string[]) => {
    console.log(fullHash);
    peerList.forEach((peer:string) => {
        console.log(peer);
    })
});

m2.get_peers("asdf");
*/

/*
OUTPUT: asdf, aa, bb, cc
 */