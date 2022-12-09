const sinon  = require('sinon');
import {assert} from "chai";
import {ConnectionType} from "../../common/MediationProtocol";
import {TestInfrastructure} from "./testInfrastructure/TestInfrastructure";

// Configuration to run the test suite multiple time with different configuration.
const runs = [
    {it: "OneMediator", option: false},
    {it: "TwoMediators", option: true}
];

runs.forEach(function (run) {
    // Due to network transmissions (mediation protocol), all tests must be performed together in the designated order.
    describe("Running" + run.it + "_IntegrationTest", function () {
        let testInfrastructure: TestInfrastructure;

        before(function (done) {
            testInfrastructure = new TestInfrastructure(run.option);
            setTimeout(() => { done() }, 50); // Timeout to allow infrastructure to start.
        });

        it("sendHandshake_noError", function (done) {
            assert.doesNotThrow(() => {
                testInfrastructure.peer1.handshake(testInfrastructure.peerId1, ConnectionType.MEDIATION);
                testInfrastructure.peer2.handshake(testInfrastructure.peerId2, ConnectionType.MEDIATION);
                setTimeout(() => { done(); },50); // Timeout to allow 'handshake' to be processed.
            });
        });

        it("isEstablished_true", function () {
            assert.isTrue(testInfrastructure.isEstablished1);
            assert.isTrue(testInfrastructure.isEstablished2);
        });

        it("getPeersBeforeAnnounce_noError", function (done) {
            assert.doesNotThrow(() => {
                testInfrastructure.peer1.get_peers(testInfrastructure.testHash);
                setTimeout(() => { done(); }, 50); // Timeout to allow 'get_peers' to be processed.
            });
        });

        it("peers_emptyResult", function () {
            const expectedResult = 0;
            const actualResult = testInfrastructure.fullHashWithPeerList.size;
            assert.equal(actualResult, expectedResult);
        });

        it("peers_consoleWarn", function (done) {
            let spy = sinon.spy(console, 'warn');
            testInfrastructure.peer1.peers(testInfrastructure.testHash, [testInfrastructure.peerId2]);
            setTimeout(() => { // Timeout to allow 'peers' to be processed.
                assert.isTrue(spy.calledOnce);
                assert(spy.calledWith("peer tried to send peerlist, which makes no sense"));
                spy.restore();
                done();
            }, 50);
        })

        it("announce_noError", function (done) {
           assert.doesNotThrow(() => {
               testInfrastructure.peer2.announce(testInfrastructure.testHash);
               setTimeout(() => { done(); }, 50); // Timeout to allow 'announce' to be processed.
           });
        });

        it("getPeersAfterAnnounce_noError", function (done) {
            assert.doesNotThrow(() => {
                testInfrastructure.peer1.get_peers(testInfrastructure.testHash);
                setTimeout(() => { done(); }, 50); // Timeout to allow 'get_peers' to be processed.
            });
        });

        it("peers_oneEntry", function () {
            const expectedSize = 1;
            const actualSize = testInfrastructure.fullHashWithPeerList.size;

            const expectedResult = testInfrastructure.peerId2;
            const actualResult = testInfrastructure.fullHashWithPeerList.get(testInfrastructure.testHash)?.[0];

            assert.equal(actualSize, expectedSize);
            assert.equal(actualResult, expectedResult);
        });

        it("signal_noError", function (done) {
            assert.doesNotThrow(() => {
                testInfrastructure.peer1.signal(testInfrastructure.testHash, testInfrastructure.peerId2, "I'd like to connect.");
                setTimeout(() => { done(); }, 50) // Timeout to allow 'signal' to be processed.
            });
        });

        it("signalBack_noError", function (done) {
            assert.doesNotThrow(() => {
                testInfrastructure.peer2.signal(testInfrastructure.testHash, testInfrastructure.peerId1, "I'd like to connect too.");
                setTimeout(() => { done(); }, 50) // Timeout to allow 'signal' to be processed.
            });
        });

        it("signal_receiveResult", function () {
            const expectedSignalPeer1 = "Received signal on peer1. Full_hash: " + testInfrastructure.testHash + ", sender peer_id: " + testInfrastructure.peerId2 + ", signal_data: I'd like to connect too.";
            const actualSignalPeer1 = testInfrastructure.receivedSignalOnPeer1;

            const expectedSignalPeer2 = "Received signal on peer2. Full_hash: " + testInfrastructure.testHash + ", sender peer_id: " + testInfrastructure.peerId1 + ", signal_data: I'd like to connect.";
            const actualSignalPeer2 = testInfrastructure.receivedSignalOnPeer2;

            assert.equal(actualSignalPeer1, expectedSignalPeer1);
            assert.equal(actualSignalPeer2, expectedSignalPeer2);
        });

        it("finish_noError", function (done) {
            assert.doesNotThrow(() => {
                testInfrastructure.peer2.finish(testInfrastructure.testHash);
                setTimeout(() => { done(); }, 50); // Timeout to allow 'finish' to be processed.
            });
        });

        it("getPeersAfterFinish_noError", function (done) {
            assert.doesNotThrow(() => {
                testInfrastructure.fullHashWithPeerList = new Map();
                testInfrastructure.peer1.get_peers(testInfrastructure.testHash);
                setTimeout(() => { done(); }, 50); // Timeout to allow 'get_peers' to be processed.
            });
        });

        it("peersAfterFinish_emptyResult", function () {
            const expectedSize = 0;
            let actualSize: number;

            if (testInfrastructure.fullHashWithPeerList.size > 0) {
                testInfrastructure.fullHashWithPeerList?.forEach(peerList => {
                    actualSize = peerList.length;
                    assert.equal(actualSize, expectedSize);
                });
            } else {
                actualSize = testInfrastructure.fullHashWithPeerList.size;
                assert.equal(actualSize, expectedSize);
            }
        });
    });
});
