const axios = require("axios");

main();

function main() {
    axios.get("http://localhost:3000/test").then((e) => {
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