#! /bin/bash

which curl &> /dev/null || sudo apt install curl

sed -i 's/"PORTNUM"/3000/g' script_test/app/config.json
sed -i 's/"PORTNUM"/3000/g' script_test/test/config.json

echo "OK"