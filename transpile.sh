# 
# /bin/bash 
# 
FILE="${1}"

if [ ! -f "${FILE}" ]; then
    echo "${0} error: >${FILE}< not found"
    exit 1
fi

while true; do
    echo "Running transpilation for ${FILE}..."
    echo "${FILE}" | NODE_OPTIONS="" DEBUG=true node es.ts

    echo "Waiting for changes in ${FILE}..."
    node bash/fs/watch.cjs "${FILE}"
done