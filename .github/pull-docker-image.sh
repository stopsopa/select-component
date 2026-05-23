
set -e
set -x
set -o pipefail

IMAGE="$(/bin/bash playwright.sh --image)"

docker pull "${IMAGE}"
