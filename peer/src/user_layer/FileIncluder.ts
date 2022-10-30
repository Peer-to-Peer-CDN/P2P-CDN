import { InfoDictionary } from "../common/InfoDictionary";
import { TorrentManager } from "../communication_layer/TorrentManager";

export class FileIncluder {
    torrentManager: TorrentManager;
    config: InfoDictionary[];

    constructor(config: InfoDictionary[]) {
        this.torrentManager = new TorrentManager();
        this.config = config;
    }

    includeDownload(cssString: string, fileName:string) {
        const element = document.querySelector(cssString);
        if(!element) {
            console.error(`Could not find "${cssString}"`);
            return;
        }

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

        //todo: fetch file intead of using class field
        this.fetchFile(fileName, (file) => {
            link.href = URL.createObjectURL(file);
            link.download = file.name;

            parent.appendChild(link);
            link.appendChild(element);
        });
    }

    private fetchFile(fileName: string, callback: (file: File) => void) {
        let dict = this.config.find(dict => {dict.file_name === fileName});
        if(!dict) {
            console.error("Configuration does not contain a file called", fileName);
            return;
        }
        this.torrentManager.registerFileEvent(dict.full_hash, callback);
    }
}