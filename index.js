const cp = require("node:child_process")
const fs = require("fs");
const axios = require("axios");
const express = require("express");
const config = require("./config.json");

var stagingDeployProc;
var stagingTestProc;
var prodDeployProc;

function currentTimestamp() {
    let timestamp = (new Date()).toString().replace(/:/ig, "-");
    if (timestamp.indexOf("(") != -1) {
        timestamp = timestamp.substring(0, timestamp.indexOf("(")).trim();
    }
    return timestamp;
}

//------------------------- SHELL ENGINE -------------------------
function initPrebuild() {
    cp.exec("./scripts/prebuild.sh", (e, out, err) => {
        if ((!e) && (err == "")) {
            initServer();
        }
    });    
}

function initServer() {
    const log = fs.createWriteStream(currentTimestamp() + " run.log");
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
        if (e == 0) {
            initDeploy();
        }
        console.log("CLOSE " + e)
        log.write("EXIT CODE " + e);
        log.close();
    })
}

function initTesting() {
    const log2 = fs.createWriteStream(currentTimestamp() + " test.log");
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
    const log3 = fs.createWriteStream(currentTimestamp() + "deploy.log");
    prodDeployProc = cp.spawn("./scripts/deploy.sh");

    prodDeployProc.stdout.on("data", e => {
        e = e.toString();
        console.log("OUT3 " + e);

        log3.write(e);
    })

    prodDeployProc.stderr.on("data", e => {
        console.log("ERR3 " + e);
        log3.write(e);
    })

    prodDeployProc.on("exit", e => {
        console.log("EXIT3 : " + e);
    })

    prodDeployProc.on("close", e => {
        console.log("CLOSE3 " + e)
        log3.write("EXIT CODE " + e);
        log3.close();
    })
}
//------------------------- *** -------------------------



const app = express();
//------------------------- BY GH WEBHOOK -------------------------
const crypto = require("crypto");
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ? process.env.WEBHOOK_SECRET : (config.WEBHOOK_SECRETS ? config.WEBHOOK_SECRETS : "" );

function verify_signature(req) {
  const signature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");
  return `sha256=${signature}` === req.headers.get("x-hub-signature-256");
};

app.post("/ghwebhook", async function (req, res) {
    if (req.headers.get(X-GitHub-Event) != "push") {
        return res.status(200).send("OK");
    }

    if (!verify_signature(req)) {
        return res.status(401).send("Unauthorized");
    } else {
        initPrebuild();
        return res.status(200).send("OK");
    }
});
//------------------------- *** -------------------------

//------------------------- PUB SUB SYSTEM -------------------------
const headerPubsub = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    "Access-Control-Allow-Origin": "*",
    'X-Accel-Buffering': 'no'    
}
let streamRes = [];
app.get('/streaminit', async function (req, res) {
    const UniqueID = Date.now();
    streamRes.push({
        ID: UniqueID,
        res
    });

    res.writeHead(200, headerPubsub);
    res.flushHeaders();
    res.write("data: { \"flag\":\"connect\", \"content\":\"START PUBSUB SYSTEM\"}\n\n");

    req.on('close', () => {
        streamRes = streamRes.filter(e => e.ID !== UniqueID);
    });    
})
function pinger() {
    streamRes.forEach(c => c.res.write("data:{}\n\n"));
}
//------------------------- *** -------------------------

app.get("/initialize", async function (req, res) {
    initPrebuild();
    return res.status(200).send("OK");
})

const server = app.listen(4000, () => {
    setInterval(pinger, 1000*10);
    console.log("SERVER READY");
})