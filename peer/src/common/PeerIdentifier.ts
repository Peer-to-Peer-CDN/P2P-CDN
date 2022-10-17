
export {PeerIdentifier};

class PeerIdentifier {
    id : number;

    constructor(id : number = 0x0) {
        this.id = id;
    }

    toString() : string {
        return this.id.toString(16);
    }

    setString(hexString: string) : void {
        this.id = parseInt(hexString, 16);
    }

}
