const express = require("express");

const app = express();

app.get("/test", async function (req, res) {
    return res.status(200).send("TEST OK2")
});

app.get("/END", function(req, res) {
    res.status(200).send("OK");
    server.close();
    return;
})

const server = app.listen(3000, () => {
    console.log("SERVER READY");
})