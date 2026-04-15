
# 
# ENVFILE=.env.playwright /bin/bash pw.sh
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