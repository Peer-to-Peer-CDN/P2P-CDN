import { MediationProtocol } from "../../common/MediationProtocol";

export interface IConnectorBase {
    protocol: MediationProtocol;
    startListener(): void;
}