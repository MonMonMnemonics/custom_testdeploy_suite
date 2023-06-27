#! /bin/bash

which curl &> /dev/null || sudo apt install curl

sed -i 's/"PORTNUM"/3000/g' script_test/app/config.json
sed -i 's/"PORTNUM"/3000/g' script_test/test/config.json

[ -d "source" ] && rm -f -r "source"
#git clone https://github.com/MonMonMnemonics/custom_testdeploy_suite.git source/app

echo "OK"