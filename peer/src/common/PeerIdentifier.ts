export {PeerIdentifier};

class PeerIdentifier {
    readonly id : string;

    constructor(id : string) {
        this.id = id;
    }

    toString() : string {
        return this.id;
    }
}
