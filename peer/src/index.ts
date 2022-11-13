import { InfoDictionary } from "./common/InfoDictionary";
import { MediationClient } from "./communication_layer/mediation/MediationClient";
import { SwarmManager } from "./communication_layer/swarm/SwarmManager";
import { generateFullHash, TorrentData } from "./communication_layer/swarm/TorrentData";
import { FileIncluder } from "./user_layer/FileIncluder";
import {io} from 'socket.io-client';
var crypto = require('crypto');


const defaultIdentityGenerator = {
    generateIdentity() {
                var shasum = crypto.createHash('sha1');
                shasum.update((Math.random() * 1000).toString());
                let id:string = shasum.digest('hex');
                console.log(id);
                return id;
            }
};


export function includeDownloads(infoDictionaries: InfoDictionary[], cssStrings: string[], mediatorAddress: string, mediatorPort: number) { 
    compareLengthAndThrowIfUnequal(infoDictionaries, cssStrings, "infodictionaries length must match cssstring length");
    let fileIncluder = new FileIncluder(infoDictionaries, mediatorAddress, mediatorPort, defaultIdentityGenerator.generateIdentity);
    for(let i = 0; i < infoDictionaries.length; i++) {
        fileIncluder.includeDownload(cssStrings[i], infoDictionaries[i].file_name);
    }
}

export function includeImages(infoDictionaries: InfoDictionary[], cssStrings: string[], mediatorAddress: string, mediatorPort: number) {
    compareLengthAndThrowIfUnequal(infoDictionaries, cssStrings, "infodictionaries length must match cssstring length");
    let fileIncluder = new FileIncluder(infoDictionaries, mediatorAddress, mediatorPort, defaultIdentityGenerator.generateIdentity);
    for(let i = 0; i < infoDictionaries.length; i++) {
        fileIncluder.includeImage(cssStrings[i], infoDictionaries[i].file_name);
    }
}

export function seedFile(file: File, mediatorAddress:string, mediatorPort: number) {

    assembleInfoDictionary(file).then(fp => {
        console.log("Seeding file: ", fp.infoDictionary);
        let torrentData = new TorrentData(fp.infoDictionary, () => {}, () => {}, fp.data);
        let mc = new MediationClient(defaultIdentityGenerator.generateIdentity(), () => io(`ws://${mediatorAddress}:${mediatorPort}`));
        let sm = new SwarmManager(fp.infoDictionary, mc, () => {}, torrentData);
        mc.announce(fp.infoDictionary.full_hash);
    });
}

export function generateArrayBufferArray(infoDictionary: InfoDictionary, file: File) : Promise<ArrayBuffer[]>{
    if(infoDictionary.total_length !== file.size) {
        console.error("file size must match specified size of meta-data");
    }
    let aba : ArrayBuffer[] = [];
    let promise = file.arrayBuffer().then((ab) => {
        for(let i = 0; i < infoDictionary.pieces_amount; i++) {

            let begin = i * infoDictionary.pieces_length;
            let end = i === infoDictionary.pieces_amount - 1 ? infoDictionary.total_length : begin + infoDictionary.pieces_length;
            aba.push(ab.slice(begin, end));
        }
        return aba;
    });
    return promise;
}

class FilePackage {
    infoDictionary: InfoDictionary;
    data: ArrayBuffer[];
}

const pieces_length = 1000;
function assembleInfoDictionary(file: File) : Promise<FilePackage> {
    let pieces_amount = file.size % pieces_length == 0 ? file.size / pieces_length : Math.floor(file.size / pieces_length) + 1;
    let info_dictionary = new InfoDictionary("", file.name, pieces_length, pieces_amount, file.size);
    let aba = generateArrayBufferArray(info_dictionary, file);
    return aba.then(buffer => {
        info_dictionary.full_hash = generateFullHash(buffer);
        let fp = new FilePackage();
        fp.infoDictionary = info_dictionary;
        fp.data = buffer;
        return fp;
    });
    
}

function compareLengthAndThrowIfUnequal(x: any, y:any, errorMsg: string) {
    if(x.length !== y.length) {
        throw new Error(errorMsg);
    }
}