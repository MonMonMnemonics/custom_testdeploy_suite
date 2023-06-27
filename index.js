const cp = require("node:child_process")
const fs = require("fs");
const axios = require("axios");

//const log = fs.createWriteStream("run " + (new Date()).toString() + ".log");
const log = fs.createWriteStream("run.log");
const log2 = fs.createWriteStream("test.log");

var stagingDeployProc;
var stagingTestProc;

cp.exec("./scripts/prebuild.sh", (e, out, err) => {
    if ((!e) && (err == "")) {
        main();
    }
});

function main() {
    stagingDeployProc = cp.spawn("./scripts/build.sh");

    stagingDeployProc.stdout.on("data", e => {
        e = e.toString();
        if (e == "enter input\n") {
            stagingDeployProc.stdin.write("MANUAL INPUT TEST\n");
        } else if (e == "SERVER READY\n") {
            initTesting();
        }
        console.log("OUT " + e);

        log.write(e);
    })

    stagingDeployProc.stderr.on("data", e => {
        console.log("ERR " + e);
        log.write(e);
    })

    stagingDeployProc.on("exit", e => {
        console.log("EXIT : " + e);
    })

    stagingDeployProc.on("close", e => {
        if (e == 137) {
            initDeploy();
        }
        console.log("CLOSE " + e)
        log.write("EXIT CODE " + e);
        log.close();
    })
}

function initTesting() {
    stagingTestProc = cp.spawn("./scripts/test.sh");

    stagingTestProc.stdout.on("data", e => {
        console.log("OUT2 " + e);
        log2.write(e);
    })

    stagingTestProc.stderr.on("data", e => {
        console.log("ERR2 " + e);
        log2.write(e);
    })

    stagingTestProc.on("close", e => {
        console.log("CLOSE2 " + e)
        if (e == 0) {
            //stagingDeployProc.stdin.write("TERMINATE\n");
            //stagingDeployProc.kill('SIGINT');
            axios.get("http://localhost:3000/END");
        } else {
            axios.get("http://localhost:3000/END");
            log2.write("ERR NO GOOD " + e);
        }
        log2.close();
    })

}

function initDeploy() {

}