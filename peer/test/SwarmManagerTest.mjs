import {SwarmManager} from "../out/communication_layer/SwarmManager.js"
import { assert } from "chai";
import { InfoDictionary } from "../out/common/InfoDictionary.js";



describe("Testing SwarmManager module", () => {
    class MockMediationClient {
        called_register = false;
        register(full_hash, event_handler) {
            this.called_register = true;
            event_handler(this.peerWireFacotry);
        }
        peerWireFacotry (x,y) {
            return new MockPeerWire({}, x, "" , y);
        }
    }
    class MockPeerWire {
        constructor(_o1, torrend_data, _o2 ,_o3) {
            for(let i = 0; i < 5; i++) {
                torrend_data.addPiece(i, new ArrayBuffer());
            }
        }
    }
    let mut_1; //module under test
    let mmc_1; 
    let complete_event_called = false;
    beforeEach(() => {
        let id = new InfoDictionary("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "test.txt", 100, 5, 450);
        mmc_1 = new MockMediationClient();
        mut_1 = new SwarmManager(id, mmc_1, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", () => {complete_event_called = true;});
    });

    it("Test SwarmManager calls register function of MediationClient after construction", () => {
        assert.isTrue(mmc_1.called_register);
    });

    it("Test Swarm Manager has size one after construction", () => {
        assert.equal(1, mut_1.swarmSize());
    });

    it("Test complete event is called after all pieces are added", () => {
        assert.isTrue(complete_event_called);
    });
});