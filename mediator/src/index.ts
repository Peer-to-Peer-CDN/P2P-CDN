import { Server } from "socket.io";
import { MediationServer } from "./MediationServer";

// TEST
/*let socket1: any;
let socket2: any;

setTimeout(() => {
    socket1 = io("ws://localhost:8888");
    const peer1 = new MediationProtocol(socket1);
    peer1.handshake("111111111111111111111111111111111111111.", ConnectionType.MEDIATION);
    peer1.on('established', () => {
        peer1.announce("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.");
        peer1.on('signal', (fullhash, senderPeerId, data) => {
            console.log("recieved signal for", fullhash, "from", senderPeerId, "with message", data);

            peer1.signal("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.", senderPeerId, "i would love to connect bro");
        });
    })
}, 1000)

setTimeout(() => {
    socket2 = io("ws://localhost:8888");
    const peer2 = new MediationProtocol(socket2);

    peer2.handshake("222222222222222222222222222222222222222.", ConnectionType.MEDIATION);
    peer2.on('established', () => {
        peer2.get_peers("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.");
    });

    peer2.on('peers', (full_hash: string, peerList: string[]) => {
        console.log("it works", full_hash, peerList);
        peer2.signal("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.", peerList[0], "hello world please connect");
    });
    peer2.on('signal', (fullhash, senderPeerid, data) => {
        console.log("...recieved signal for", fullhash, "from", senderPeerid, "with message", data);
    });
}, 2000); */


setTimeout(() => {
    let mediator1 = new MediationServer(new Server(8888, {cors: {origin: '*'}}), ["127.0.0.1:5556"], 5555, 8888);
}, 500);

setTimeout(() => {
    let mediator2 = new MediationServer(new Server(8889, {cors: {origin: '*'}}), false, 5556, 8889);
}, 1)