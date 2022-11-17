import { IMediationClient } from "./IMediationClient";

export type MediationClientFactory = (peerId:string) => IMediationClient;