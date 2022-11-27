const DHT = require('bittorrent-dht');

export class DHTNode {
    private nodeId: string;
    private dht: any;
    private port:number;

    private mediatorCallbacks = new Map();

    constructor(nodeId: string, bootstrapNodes: string[] | false, port:number, onReadyCallback?: () => void) {
        this.port = port;
        this.nodeId = nodeId;
        this.dht = new DHT({nodeId: nodeId, bootstrap: bootstrapNodes, host: "localhost"});
        this.dht.listen(port, () => { console.log("dht-node now listening on ", port); });

        this.dht.on('error', (error: any) => {
            console.error(error);
        });
        this.dht.on('warning', (warning: any) => {
            console.error(warning);
        });
        
        this.dht.on('ready', () => {
            if(!bootstrapNodes) {
                this.dht.addNode({host: "localhost", port: this.port});
            }
            if(onReadyCallback) {
                onReadyCallback();
            }
        });
        this.dht.on('peer', (peer:any, info_hash:Buffer, from:any) => {
            this.mediatorCallbacks.get(info_hash.toString('utf-8')).forEach((cb :any) => {
                cb(peer.host, peer.port);
            });
        });
    }

    public announce(info_hash: string, port: number) {
        this.dht.announce(Buffer.from(info_hash,'utf-8'), port);
    }

    public find_mediators(info_hash: string, callback: (hostname:string, port:number) => void) {
        if(!this.mediatorCallbacks.get(info_hash)) {
            this.mediatorCallbacks.set(info_hash, []);
        }

        this.mediatorCallbacks.get(info_hash).push(callback);
        this.dht.lookup(Buffer.from(info_hash, 'utf-8'));
    }
}