import { IIdentityGenerator } from "../../common/IIdentityGenerator"
import { DefaultIdentityGenerator } from "../../common/DefaultIdentityGenerator"
import { InfoDictionary } from "./common/InfoDictionary";
import { ICECandidate, MediationClient } from "./communication_layer/mediation/MediationClient";
import { SwarmManager } from "./communication_layer/swarm/SwarmManager";
import { generateFullHash, TorrentData } from "./communication_layer/swarm/TorrentData";
import { FileIncluder } from "./user_layer/FileIncluder";
import {io} from 'socket.io-client';

const identityGenerator: IIdentityGenerator = new DefaultIdentityGenerator();


let fileIncluder: FileIncluder;
let iceCandidates: ICECandidate[];

export function initialize(infoDictionaries: InfoDictionary[], mediatorAddress: string, mediatorPort: number, enableCaching: boolean) {
    fileIncluder = new FileIncluder(infoDictionaries, mediatorAddress, mediatorPort, () => identityGenerator.generateIdentity(), iceCandidates, enableCaching);
}

export function overrideICECandidates(candidates: ICECandidate[]) {
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

export function includeImages(fileNames: string[], cssStrings: string[]) {
    checkInitializedOrError();
    compareLengthAndThrowIfUnequal(fileNames, cssStrings, "fileNames length must match cssstring length");
    for(let i = 0; i < fileNames.length; i++) {
        fileIncluder.includeImage(cssStrings[i], fileNames[i]);
    }
}

export function seedFile(file: File, mediatorAddress:string, mediatorPort: number, dictionaryCallback: (dictionaryString: Object) => void) {

    FileIncluder.assembleInfoDictionary(file).then(fp => {
        console.log("Seeding file: ", fp.infoDictionary);
        let torrentData = new TorrentData(fp.infoDictionary, () => {}, () => {}, fp.data);
        let mc = new MediationClient(identityGenerator.generateIdentity(), () => io(`ws://${mediatorAddress}:${mediatorPort}`), iceCandidates);
        let sm = new SwarmManager(fp.infoDictionary, mc, () => {}, torrentData);
        mc.announce(fp.infoDictionary.full_hash);
        dictionaryCallback(fp.infoDictionary);
    });
}

function compareLengthAndThrowIfUnequal(x: any, y:any, errorMsg: string) {
    if(x.length !== y.length) {
        throw new Error(errorMsg);
    }
}