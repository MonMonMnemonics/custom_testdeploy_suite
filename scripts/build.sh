#! /bin/bash
[ -d "source" ] && rm -f -r "source"

#git clone https://github.com/MonMonMnemonics/gmailsmtp2.git source/app

#cd source

#npm install
#npm run build
#npm run predeploy
#npm run deploy

cd script_test/app
npm run start 

#cd script_test/app
#npm run start &

#serverPID=$!

#while true; do
#    read cmd
#    if [ $cmd == "TERMINATE" ]; then
#        echo "TERMINATE"
#        trap 'trap - SIGTERM && kill 0' SIGINT SIGTERM EXIT
#    fi
#done