import { InfoDictionary } from "../common/InfoDictionary";
import { MediationClient } from "../communication_layer/mediation/MediationClient";
import { CompleteEvent } from "../communication_layer/swarm/ITorrentData";
import { SwarmManager } from "../communication_layer/swarm/SwarmManager";
import { TorrentManager } from "../communication_layer/TorrentManager";
import { io } from "socket.io-client";

export class FileIncluder {
    torrentManager: TorrentManager;
    torrents: InfoDictionary[];
    mediationClient : MediationClient;
    peerId: string;

    constructor(torrents: InfoDictionary[], mediatorAddress: string, mediatorPort: number, identityGenerator:any) {
        this.peerId = identityGenerator();
        this.torrentManager = new TorrentManager();
        this.torrents = torrents;
        this.mediationClient = new MediationClient(this.peerId, () => io(`ws://${mediatorAddress}:${mediatorPort}`)); 
    }

    includeDownload(cssString: string, fileName:string) {
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

        this.fetchFile(fileName, (file) => {
            link.href = URL.createObjectURL(file);
            link.download = file.name;

            parent.appendChild(link);
            link.appendChild(element);
        });
    }

    includeImage(cssString: string, fileName: string) {
        const element = this.loadElementOrError(cssString) as HTMLImageElement;
        this.fetchFile(fileName, (file) => {
            const reader = new FileReader();
            reader.onload = (link) => {
                element.src = link.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    }

    private fetchFile(fileName: string, callback: (file: File) => void) {
        let dict = this.torrents.find(dict => dict.file_name === fileName);
        console.log(this.torrents, "!");
        if(!dict) {
            console.error("Configuration does not contain a file called", fileName);
            return;
        }
        this.torrentManager.addTorrent(dict, (complete: CompleteEvent) => new SwarmManager(dict!, this.mediationClient, complete), callback);
    }

    private loadElementOrError(cssString: string) : Element {
        const element = document.querySelector(cssString);
        if(!element) {
            console.error(`Could not find "${cssString}"`);
            throw new Error(`Could not find element identified by ${cssString}`);
        }

        return element;
    }
}