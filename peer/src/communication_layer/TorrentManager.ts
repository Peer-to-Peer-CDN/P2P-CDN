import { InfoDictionary } from "../common/InfoDictionary";
import { SwarmManagerFactory } from "./swarm/ISwarmManagerFactory";
import { SwarmManager } from "./swarm/SwarmManager";

    

export type FileEvent = (file: File) => void;
export class TorrentManager {
    swarms: Map<string, SwarmManager> = new Map();
    callbacks : Map<string, FileEvent[]> = new Map();
    doneFiles: Map<string, File> = new Map();


    constructor() {
    }

    addTorrent(info_dictionary: InfoDictionary, createSwarmManager: SwarmManagerFactory, completeEvent: FileEvent) {
        if(this.doneFiles.get(info_dictionary.full_hash)) {
            completeEvent(this.doneFiles.get(info_dictionary.full_hash)!);
            return;
        }

        if(!this.callbacks.get(info_dictionary.full_hash)) {
            this.callbacks.set(info_dictionary.full_hash, [completeEvent]);
            this.swarms.set(info_dictionary.full_hash, createSwarmManager((data: ArrayBuffer[]) => {
                let file: File = this.generateFile(data, info_dictionary.file_name, info_dictionary.total_length, info_dictionary.pieces_length);
                this.doneFiles.set(info_dictionary.full_hash, file);
                this.callbacks.get(info_dictionary.full_hash)?.forEach(cb => {
                    cb(file);
                });
            }));
        } else {
            this.callbacks.get(info_dictionary.full_hash)?.push(completeEvent);
        }
        
            
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