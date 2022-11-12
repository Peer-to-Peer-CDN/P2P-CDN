import { InfoDictionary } from "./common/InfoDictionary";
import { MediationClient } from "./communication_layer/mediation/MediationClient";
import { SwarmManager } from "./communication_layer/swarm/SwarmManager";
import { generateFullHash, TorrentData } from "./communication_layer/swarm/TorrentData";
import { FileIncluder } from "./user_layer/FileIncluder";
import { MediationEventCallback, MediationProtocol } from "../../common/MediationProtocol";
import {io} from 'socket.io-client';

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

    let hash = generateFullHash(data)

    let infoDictionary = new InfoDictionary(hash, "test.txt", 100, 5, 450, []);
    let fileIncluder = new FileIncluder([infoDictionary], "localhost", 8888, defaultIdentityGenerator.generateIdentity);
    fileIncluder.includeDownload(".test", "test.txt");

}
export function seed() {
    
    let hash = generateFullHash(data);

    let infoDictionary = new InfoDictionary(hash, "test.txt", 100, 5, 450);

    let torrent_data = new TorrentData(infoDictionary, () => {}, () => {}, data);
    let mc = new MediationClient("1123456789012345678901234567890234567890", () => io(`ws://localhost:8888`));
    let sm = new SwarmManager(infoDictionary, mc, () => {}, torrent_data);
    mc.announce(infoDictionary.full_hash);

}