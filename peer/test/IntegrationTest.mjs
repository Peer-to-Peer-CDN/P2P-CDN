import {assert} from "chai";
import mocha from "mocha";
import {InfoDictionary} from "../out/peer/src/common/InfoDictionary.js";

class MockMediationProtocol { //give this to both sides of the test
    
    on(event, ...args) {

    }
    
    emit(event, ...args) {

    }
    
}


describe("Peer integration test", () => {
    let data = [];
    let infoDictionary = new InfoDictionary("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "hello.txt", 100, 5, 450);
    before(() => {
        fillData(data);

    });
});


function fillData(data) {
    for(let i = 0; i < 4; i++) {
        data.push(new ArrayBuffer(100))
        let content = new Uint8Array(data[i]);
        let arr = [];
        for(let j = 0; j <100; j++) {
            arr.push(48 + i);
        }
    
        content.set(arr, 0); 
    }
    data.push(new ArrayBuffer(50));
    let content = new Uint8Array(data[4]);
    let arr = [];
    for(let i = 0; i< 50; i++) {
        arr.push(48 + 4);
    }
    content.set(arr, 0);
}