import { InfoDictionary } from "./common/InfoDictionary";
import { PeerWire } from "./communication_layer/PeerWire";
import { TorrentData } from "./communication_layer/TorrentData";
import { IP2PTransport } from "./transport_layer/IP2PTransport";
var SimplePeer = require('simple-peer');
import { FileIncluder } from "./user_layer/FileIncluder";

let leecher: IP2PTransport = new SimplePeer({initiator: true}); 
let seeder: IP2PTransport = new SimplePeer({initiator: false});

leecher.on('signal', data => {
    seeder.signal(data);
});

seeder.on('signal', (data) => { 
    leecher.signal(data);
});

//let wireLeech = new BittorrentProtocol();
//let wireSeed = new BittorrentProtocol();

//leecher.pipe(wireLeech).pipe(leecher);
//seeder.pipe(wireSeed).pipe(seeder);

/*let id = new InfoDictionary("ffffffffffffffffffffffffffffffffffffffff", "testfile", 100,5,450);
let data: Array<ArrayBuffer> = [new ArrayBuffer(100), new ArrayBuffer(100), new ArrayBuffer(100), new ArrayBuffer(100), new ArrayBuffer(50)];

for(let i = 0; i < 5; i++) {
    let holder = new Uint8Array(data[i]);
    let arr: number[] = []; 
    let max = i < 4 ? 100 : 50;
    for(let i = 0; i < max; i++) {
        arr.push(i % 26 + 26);
    }
    holder.set(arr, 0);
}*/

let content = new Uint8Array(50);
let arr = [];
for(let i = 48; i < 48 + 50; i++) { 
    arr.push(i); 
}
content.set(arr);


let file = new File([content], "test.txt", {type: "application/octet-stream"});
let includer = new FileIncluder();

const div = document.createElement('div');
div.innerHTML = "<h1>hello world</h1>";
document.body.appendChild(div);
div.className="hello";

includer.file = file;
includer.includeDownload(".hello");

/*
// Leecher side (tested)
let td = new TorrentData(id, _ => {console.log("complete!!");});
let leecherPeerId = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
leecher.on('connect', () => {
    console.log("leecher connected");

    let leecherPeer = new PeerWire(leecher, td, true, leecherPeerId);
});

// Seeder side (tester)
let td2 = new TorrentData(id,_ => {console.log("complete!!");}, data);
let seederPeerid = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
seeder.on('connect', () => {
    console.log("seeder connected");

    let seederPeer = new PeerWire(seeder, td2, false, seederPeerid);
}); 
*/