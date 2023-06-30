#! /bin/bash

which curl &> /dev/null || sudo apt install curl

#sed 's/"PORTNUM"/3000/g' script_test/app/config.json >> script_test/app/config2.json
#sed 's/"PORTNUM"/3000/g' script_test/test/config.json >> script_test/test/config2.json

[ -d "source" ] && rm -f -r "source"
#git clone https://github.com/MonMonMnemonics/custom_testdeploy_suite.git source/app

echo "OK"