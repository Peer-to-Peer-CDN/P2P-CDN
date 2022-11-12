import { InfoDictionary } from "../common/InfoDictionary";
import { SwarmManagerFactory } from "./swarm/ISwarmManagerFactory";
import { SwarmManager } from "./swarm/SwarmManager";

    

export type FileEvent = (file: File) => void;
export class TorrentManager {
    swarms: Map<string, SwarmManager>;
    callbacks : Map<string, FileEvent>;


    constructor() {
        this.swarms = new Map();
    }

    addTorrent(info_dictionary: InfoDictionary, createSwarmManager: SwarmManagerFactory, completeEvent: FileEvent) {
        this.swarms.set(info_dictionary.full_hash, createSwarmManager((data: ArrayBuffer[]) => {
            let file: File = this.generateFile(data, info_dictionary.file_name, info_dictionary.total_length, info_dictionary.pieces_length);
            let callback = completeEvent 
            if(callback) {
                callback(file);
            }
        }));
    }

//TODO revisit
    private generateFile(data: ArrayBuffer[], filename: string, filelength: number, piecelength: number): File { 
        let fileContent = new Uint8Array(filelength);
        let index = 0;
        data.forEach(ab => {
            let pieceContent = new Uint8Array(ab);
            fileContent.set(pieceContent, index++ * piecelength);
        });
        let file = new File([fileContent], filename ,{
            type: "application/octet-stream"
        });
        return file;
    }
}