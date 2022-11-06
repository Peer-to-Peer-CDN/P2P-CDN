import { CompleteEvent } from "./ITorrentData";
import { SwarmManager } from "./SwarmManager";

export type SwarmManagerFactory = (callback: CompleteEvent) => SwarmManager;
