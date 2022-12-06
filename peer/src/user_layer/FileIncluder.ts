import { InfoDictionary } from "../common/InfoDictionary";
import { ICECandidate, MediationClient } from "../communication_layer/mediation/MediationClient";
import { CompleteEvent } from "../communication_layer/swarm/ITorrentData";
import { SwarmManager } from "../communication_layer/swarm/SwarmManager";
import { TorrentManager } from "../communication_layer/TorrentManager";
import { io } from "socket.io-client";
import localStorage from "localforage";
import { generateFullHash, TorrentData } from "../communication_layer/swarm/TorrentData";
import { IIdentityGenerator } from "../../../common/IIdentityGenerator";
import { DefaultIdentityGenerator } from "../../../common/DefaultIdentityGenerator";

export class FileIncluder {
    torrentManager: TorrentManager;
    torrents: InfoDictionary[];
    mediationClient : MediationClient;
    peerId: string;
    enableCaching: boolean = false;

    readonly identityGenerator: IIdentityGenerator = new DefaultIdentityGenerator();

    constructor(torrents: InfoDictionary[], mediatorAddress: string, mediatorPort: number, identityGenerator:any, iceCandidates?: ICECandidate[], enableCaching?: boolean) {
        this.peerId = identityGenerator();
        this.torrentManager = new TorrentManager();
        this.torrents = torrents;
        this.mediationClient = new MediationClient(this.peerId, () => io(`ws://${mediatorAddress}:${mediatorPort}`), iceCandidates); 
        if(enableCaching) {this.enableCaching = enableCaching;}
    }

    includeDownload(cssString: string, fileName:string) {
        let startTime = performance.now();

        const element = this.loadElementOrError(cssString);

        const parent = element.parentElement;
        if(!parent) {
            console.error(`Element identified by css-string must have a parent element`);
            return;
        }

        parent?.removeChild(element);
        const link = document.createElement('a');
        link.style.color = "inherit";
        link.style.textDecoration = "inherit";
        link.style.display = "inherit";

        let cb = (file: File) => {
            link.href = URL.createObjectURL(file);
            link.download = file.name;

            parent.appendChild(link);
            link.appendChild(element);

            console.log("performance", performance.now() - startTime);
        };

        if(this.enableCaching) {
            this.fetchFileCacheFirst(fileName, cb);
        } else {
            this.fetchFile(fileName, cb);
        }
        
    }

    includeImage(cssString: string, fileName: string) {
        let startTime = performance.now();
        const element = this.loadElementOrError(cssString) as HTMLImageElement;
        let cb = (file: File) => {
            const reader = new FileReader();
            reader.onload = (link) => {
                element.src = link.target?.result as string;
            };
            reader.readAsDataURL(file);
            console.log("performance", performance.now() - startTime);
        };

        if(this.enableCaching) {
            this.fetchFileCacheFirst(fileName, cb);
        } else {
            this.fetchFile(fileName, cb);
        }
    }

    private fetchFileCacheFirst(fileName: string, callback: (file: File) => void) {
        let dict = this.torrents.find(dict => dict.file_name === fileName);
        if(!dict) { console.error("could not find", fileName); return;};
        this.readCache(dict!.full_hash, (file) => {
            if(file) { 
                callback(file);
                this.seedFile(file, (id) => { console.log("seeding cached", id)});
            } else {
                this.fetchFile(fileName, callback);
            }
        });
    }

    private fetchFile(fileName: string, callback: (file: File) => void) {
        let dict = this.torrents.find(dict => dict.file_name === fileName);
        if(!dict) {
            console.error("Configuration does not contain a file called", fileName);
            return;
        }
        this.torrentManager.addTorrent(dict, (complete: CompleteEvent) => new SwarmManager(dict!, this.mediationClient, complete), (file) => {
            callback(file); 
            this.writeCache(dict!.full_hash, file);
        });
    }

    private loadElementOrError(cssString: string) : Element {
        const element = document.querySelector(cssString);
        if(!element) {
            console.error(`Could not find "${cssString}"`);
            throw new Error(`Could not find element identified by ${cssString}`);
        }

        return element;
    }

    private readCache(full_hash: string, cb:  (val:File) => void) {
        localStorage.getItem(full_hash, (err, val) => {
            if(!err) {
                cb(val as File);
            }
        });
    }

    private writeCache(full_hash: string, file: File) : void{
        localStorage.setItem(full_hash, file);
    }


    public seedFile(file: File, dictionaryCallback: (dictionaryString: Object) => void) {

        this.assembleInfoDictionary(file).then(fp => {
            console.log("Seeding file: ", fp.infoDictionary);
            let torrentData = new TorrentData(fp.infoDictionary, () => {}, () => {}, fp.data);
            let sm = new SwarmManager(fp.infoDictionary, this.mediationClient, () => {}, torrentData);
            this.mediationClient.announce(fp.infoDictionary.full_hash);
            dictionaryCallback(fp.infoDictionary);
        });
    }



    public generateArrayBufferArray(infoDictionary: InfoDictionary, file: File) : Promise<ArrayBuffer[]>{
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


    readonly pieces_length = 15_000; //MAX is around 200_000
    public assembleInfoDictionary(file: File) : Promise<FilePackage> {
        let pieces_amount = file.size % this.pieces_length == 0 ? file.size / this.pieces_length : Math.floor(file.size / this.pieces_length) + 1;
        let info_dictionary = new InfoDictionary("", file.name, this.pieces_length, pieces_amount, file.size);
        let aba = this.generateArrayBufferArray(info_dictionary, file);
        return aba.then(buffer => {
            buffer.forEach(ab => {
                info_dictionary.piece_hashes.push(generateFullHash([ab])); 
            });
            info_dictionary.full_hash = generateFullHash(buffer);
            let fp = new FilePackage();
            fp.infoDictionary = info_dictionary;
            fp.data = buffer;
            return fp;
        });
    
    }
}

    export class FilePackage {
        infoDictionary: InfoDictionary;
        data: ArrayBuffer[];
    }