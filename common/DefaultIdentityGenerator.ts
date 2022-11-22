import {IIdentityGenerator} from "./IIdentityGenerator";
const crypto = require('crypto');

export class DefaultIdentityGenerator implements IIdentityGenerator {
    generateIdentity(): string {
        const shaSum = crypto.createHash('sha1');
        shaSum.update((Math.random() * 1000).toString());
        let id:string = shaSum.digest('hex');
        console.log(id);
        return id;
    }
}