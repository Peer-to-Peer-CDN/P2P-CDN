import "mocha";
import {assert} from "chai";
import {Server} from "socket.io";
import {io} from "socket.io-client";
import {ConnectionKeyWords, ConnectionType, MediationProtocol} from "../../common/MediationProtocol";
import {MediationServer} from "../src/MediationServer";
import {TestIdentityGenerator} from "./helper/TestIdentityGenerator";

describe('PeerToMediator', function () {
    const identityGenerator = new TestIdentityGenerator();
    let peer1: MediationProtocol;
    let isEstablished = false;

    before(function (done) {
        let mediator = new MediationServer(new Server(8888, {cors: {origin: '*'}}), false, 5555, 8888);
        mediator.run();

        setTimeout(() => { // Timeout to allow mediator to start.
            peer1 = new MediationProtocol(io("ws://localhost:8888"));
            peer1.on(ConnectionKeyWords.ESTABLISHED, () => { isEstablished = true; });
            done();
        }, 25);
    });

    it("sendHandshake_NoError", function(done) {
        assert.doesNotThrow(() => {
            let peerId1 = identityGenerator.generateIdentity(1);
            peer1.handshake(peerId1, ConnectionType.MEDIATION);
            setTimeout(() => { done(); },25); // Timeout to allow handshake to be processed.
        });
    });

    it("isEstablished_true", function() {
        assert.isTrue(isEstablished);
    });
});

