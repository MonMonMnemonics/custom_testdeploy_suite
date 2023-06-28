const express = require("express");
const config = require("./config.json");
const app = express();

app.get("/test", async function (req, res) {
    return res.status(200).send("TEST OK")
});

app.get("/END", function(req, res) {
    res.status(200).send("OK");
    server.close();
    return;
})

const server = app.listen(isNaN(Number(config.PORT)) ? 3000 : Number(config.PORT), () => {
    console.log("SERVER READY");
})