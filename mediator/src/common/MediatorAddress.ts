export class MediatorAddress {
    public url: string;

    constructor(mediatorAddress: string, mediatorPort: number) {
        this.url = mediatorAddress + ":" + mediatorPort;
    }
}