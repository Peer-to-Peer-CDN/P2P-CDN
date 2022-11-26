import { DHTNode } from "./src/communication/DHTNode";

let dht1 = new DHTNode("ffffffffffffffffffffffffffffffffffffffff", false, 9990, () => {
    let dht2 = new DHTNode("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", ["127.0.0.1:9990"], 9991, () => {
        dht2.announce("1111111111111111111111111111111111111111");
        setTimeout(() => {
        dht2.find_mediators("3333333333333333333333333333333333333333", (host, port) => {
            console.log("it should be port 9993 and it is ", port);
        });
        }, 200);

    });

    let dht3 = new DHTNode("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", ["127.0.0.1:9990"], 9992, () => {
        dht3.announce("2222222222222222222222222222222222222222");
    });

    let dht4 = new DHTNode("cccccccccccccccccccccccccccccccccccccccc", ["127.0.0.1:9990"], 9993, () => {
        dht4.announce("3333333333333333333333333333333333333333");
    });
});


