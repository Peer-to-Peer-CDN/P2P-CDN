import { InfoDictionary } from "../common/InfoDictionary";
import { PeerIdentifier } from "../common/PeerIdentifier";
import { IMediationClient } from "./IMediationClient";
import { MediationClient } from "./MediationClient";
import { SwarmManager } from "./SwarmManager";
var crypto = require('crypto');

    const defaultIdentityGenerator = {
        generateIdentity() {
            var shasum = crypto.createHash('sha1');
            shasum.update(Math.random());
        
            let id:string = shasum.digest('hex');
            let identifier = new PeerIdentifier(id);
            return identifier;
        }
    };

export type FileEvent = (file: File) => void;
export class TorrentManager {
    swarms: Map<string, SwarmManager>;
    mediationClient : IMediationClient;
    peerIdentity : PeerIdentifier;
    callbacks : Map<string, FileEvent>;



    constructor(mediatorAddress:string, mediatorPort:number, identityGenerator = defaultIdentityGenerator) {
        this.mediationClient = new MediationClient(this.peerIdentity.toString(), mediatorAddress, mediatorPort);
        this.peerIdentity = identityGenerator.generateIdentity(); 
    }

    addTorrent(info_dictionary: InfoDictionary) {
        this.swarms.set(info_dictionary.full_hash, new SwarmManager(info_dictionary, this.mediationClient, this.peerIdentity, (data: ArrayBuffer[]) => {
            let file: File = this.generateFile(data, info_dictionary.file_name, info_dictionary.total_length, info_dictionary.pieces_length);
            let callback = this.callbacks.get(info_dictionary.full_hash);
            if(callback) {
                callback(file);
            }
        }));
    }

    registerFileEvent(infoHash: string ,eventHandler: FileEvent) {
        this.callbacks.set(infoHash, eventHandler); //is saved by constructor
    }

    private generateFile(data: ArrayBuffer[], filename: string, filelength: number, piecelength: number): File { 
        let fileContent = new Uint8Array(filelength);
        let index = 0;
        data.forEach(ab => {
            let pieceContent = new Uint8Array(ab);
            fileContent.set(pieceContent, index++ * piecelength);
        });
        let file = new File(data, filename ,{
            type: "application/octet-stream"
        });
        return file;
    }
}