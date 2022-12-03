import {IIdentityGenerator} from "../../../common/IIdentityGenerator";

export class TestIdentityGenerator implements IIdentityGenerator {
    generateIdentity(input: number): string {
        return String(input).padStart(40, '0');
    }
}