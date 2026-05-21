
# 
# Runs server then runs playwright tests and then stops server
# ENVFILE=.env.playwright /bin/bash pw.sh
#
# Don't use it if you already have running server and don't want to restart all the time
# 

set -e
source .env.sh

function cleanup {
  ps aux | grep "${PROJECT_NAME}" | /bin/bash bash/proc/reaper.sh
}

cleanup

trap cleanup EXIT

node --env-file .env --watch server.js --flag "${PROJECT_NAME}" & 

sleep 1

curl http://${HOST}:${PORT}/health
echo ""

/bin/bash playwright.sh "$@"