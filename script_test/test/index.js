const axios = require("axios");
const config = require("./config.json");

main();

function main() {
    axios.get("http://localhost:" + (isNaN(Number(config.PORT)) ? 3000 : config.PORT) + "/test").then((e) => {
        if (e.data == "TEST OK") {
            console.log(e.status + " " + e.data);
        } else {
            process.exitCode = 1;    
        }        
    }).catch(e => {
        console.log(e);
        process.exitCode = 1;
    })
}