import { InfoDictionary } from "./common/InfoDictionary";
import { ICECandidate, MediationClient } from "./communication_layer/mediation/MediationClient";
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

let fileIncluder: FileIncluder;
let iceCandidates: ICECandidate[];

export function initialize(infoDictionaries: InfoDictionary[], mediatorAddress: string, mediatorPort: number) {
    fileIncluder = new FileIncluder(infoDictionaries, mediatorAddress, mediatorPort, defaultIdentityGenerator.generateIdentity, iceCandidates);
}

export function overrrideICECandidates(candidates: ICECandidate[]) {
    iceCandidates = candidates;
}

function checkInitializedOrError() {
    if(!fileIncluder) {
        console.error("please call function: initialize first");
    }
}

export function includeDownloads(fileNames: string[], cssStrings: string[]) { 
    checkInitializedOrError();
    compareLengthAndThrowIfUnequal(fileNames, cssStrings, "fileNames length must match cssstring length");
    for(let i = 0; i < fileNames.length; i++) {
        fileIncluder.includeDownload(cssStrings[i], fileNames[i]);
    }
}

export function includeImages(fileNames: string[], cssStrings: string[], mediatorAddress: string, mediatorPort: number) {
    checkInitializedOrError();
    compareLengthAndThrowIfUnequal(fileNames, cssStrings, "fileNames length must match cssstring length");
    for(let i = 0; i < fileNames.length; i++) {
        fileIncluder.includeImage(cssStrings[i], fileNames[i]);
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

const pieces_length = 100000;
function assembleInfoDictionary(file: File) : Promise<FilePackage> {
    let pieces_amount = file.size % pieces_length == 0 ? file.size / pieces_length : Math.floor(file.size / pieces_length) + 1;
    let info_dictionary = new InfoDictionary("", file.name, pieces_length, pieces_amount, file.size);
    let aba = generateArrayBufferArray(info_dictionary, file);
    return aba.then(buffer => {
        buffer.forEach(ab => {
            info_dictionary.piece_hashes.push(generateFullHash([ab]));
        });
        console.log("pieces look like this:", buffer);
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