import { Server } from "socket.io";
import { MediationServer } from "./MediationServer";

const args = process.argv.slice(2);
if(args.length < 2) {
    console.error("amount of arguments is wrong");
    process.exit();
}

let mediator_port = Number(args[0]);
let dht_port = Number(args[1]);
let dht_bootstrapper = args.length === 3 ? [args[2]] : false;

console.log("mediation port: ", mediator_port);
console.log("dht_port", dht_port);
console.log("bootstrapper", dht_bootstrapper);

let mediator = new MediationServer(new Server(mediator_port, {cors: {origin: '*'}}), dht_bootstrapper, dht_port, mediator_port);
mediator.run();