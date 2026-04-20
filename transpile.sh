

if [ $# -eq 0 ]; then
    echo "Usage: $0 <file1> [file2 ...]"
    exit 1
fi

FILES=("$@")

while true; do
    echo "Running transpilation for ${FILES[*]}..."
    printf "%s\n" "${FILES[@]}" | NODE_OPTIONS="" DEBUG=true node es.ts

    echo "Waiting for changes..."
    node bash/fs/watch.cjs "${FILES[@]}"
    STATUS=$?
    if [ $STATUS -eq 130 ]; then
        exit 0
    fi
done