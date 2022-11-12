import { InfoDictionary } from "./common/InfoDictionary";
import { MediationClient } from "./communication_layer/mediation/MediationClient";
import { SwarmManager } from "./communication_layer/swarm/SwarmManager";
import { TorrentData } from "./communication_layer/swarm/TorrentData";
import { FileIncluder } from "./user_layer/FileIncluder";
import { MediationEventCallback, MediationProtocol } from "../../common/MediationProtocol";
import {io} from 'socket.io-client';

export function leech() {
    var crypto = require('crypto');

    const defaultIdentityGenerator = {
            generateIdentity() {
                var shasum = crypto.createHash('sha1');
                shasum.update(Math.random());
            
                let id:string = shasum.digest('hex');
                return id;
            }
        };


    let infoDictionary = new InfoDictionary("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "test.txt", 100, 5, 450);
    let fileIncluder = new FileIncluder([infoDictionary], "localhost", 8888, defaultIdentityGenerator.generateIdentity);
    fileIncluder.includeDownload(".test", "test.txt");

}
export function seed() {
    let data: ArrayBuffer[] = [];

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

    let infoDictionary = new InfoDictionary("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "test.txt", 100, 5, 450);

    let torrent_data = new TorrentData(infoDictionary, () => {}, () => {}, data);
    let mc = new MediationClient("1123456789012345678901234567890234567890", () => io(`ws://localhost:8888`));
    let sm = new SwarmManager(infoDictionary, mc, () => {}, torrent_data);
    mc.announce(infoDictionary.full_hash);

}
    
/*
let data: ArrayBuffer[] = [];

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

let fileIncluder = new FileIncluder([infoDictionary], "localhost", 8888);
function includeFile(cssString:string, fileName: string) {
    fileIncluder.includeDownload(cssString, fileName);
}

function seedFile(data: ArrayBuffer[], infoDictionary: InfoDictionary) {
    let torrent_data = new TorrentData(infoDictionary, () => {}, () => {}, data);
    let mc = new MediationClient("1123456789012345678901234567890234567890", "localhost", 8888);
    let sm = new SwarmManager(infoDictionary, mc, () => {}, torrent_data);
    mc.announce(infoDictionary.full_hash);
}

const io = new Server(8888);
io.on("connection", (socket) => {
    let mp = new MediationProtocol(socket);
    mp.on('get_peers', full_hash => {
        console.log(full_hash); 
    });
});


    seedFile(data, infoDictionary); 
    includeFile(".test", "hello.txt");





/*
let leecher: IP2PTransport = new SimplePeer({initiator: true}); 
let seeder: IP2PTransport = new SimplePeer({initiator: false});

leecher.on('signal', data => {
    seeder.signal(data);
});

seeder.on('signal', (data) => { 
    leecher.signal(data);
});*/

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
/*
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
*/
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