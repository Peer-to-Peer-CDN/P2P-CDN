import { InfoDictionary } from "./common/InfoDictionary";


const manager = new TorrentManager();


async function fetchAll(): Promise<Map<string, File>> {
    let map = new Map<string, File>();

    //todo: fill map with downloaded torrents!

    return map;
}

async function fetchFile(info_dictionary_file_name : string) : Promise<File> {
    return null as unknown as File; //todo replace
} 

function readDictionary(info_dictionary_file_name: string) : InfoDictionary {
    let obj : any = readFile(info_dictionary_file_name);
    let info_dictionary = new InfoDictionary(
        obj.full_hash, 
        obj.file_name, 
        obj.pieces_length, 
        obj.pieces_amount, 
        obj.total_length);

    return info_dictionary; 
}

function readFile(file_name: string) : Object { 


    return {};
}