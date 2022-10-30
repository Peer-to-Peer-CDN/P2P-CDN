import { assert } from "chai";
import {TorrentData} from "../out/communication_layer/TorrentData.js";
import {InfoDictionary} from "../out/common/InfoDictionary.js";

describe("Testing torrent data module", () => {
    let mut; //module under test;
    let called = false;
    let cb = _ => called = true;

    beforeEach(() => {
        let id = new InfoDictionary(
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "test.txt",
            100, 
            5, 
            450);
        mut = new TorrentData(id, cb);
    });

    it("nextNeededPieceIndex gives all pieces", () => {
        for(let i = 0; i < 5; i++) {
            assert.equal(i, mut.nextNeededPieceIndex());
            mut.acquirePiece(i);
        }
    });
    it("HaveField is initialized false", () => {
        let hf = mut.getHaveField();
        for(let i = 0; i < 5; i++) {
            hf[i] == false;
        }
    });
    it("isComplete() true after addpiece on every index", () => {
        for(let i = 0; i < 5; i++) {
            mut.addPiece(i, new ArrayBuffer());
        }
        assert.isTrue(mut.isComplete());
    });
    it("callback is called after complete", () => {
        for(let i = 0; i < 5; i++) {
            mut.addPiece(i, new ArrayBuffer());
        }
        assert.isTrue(called);
    });
});