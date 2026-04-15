
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

ENVFILE="${ENVFILE:-.env}"

if [[ -f "${DIR}/${ENVFILE}" ]]; then
    # https://unix.stackexchange.com/a/79065
    eval "$(/bin/bash "${DIR}/bash/exportsource.sh" "${DIR}/${ENVFILE}")"
fi

# -----------------------------------------------------------------------------
# Validation
# -----------------------------------------------------------------------------

re_number='^[0-9]+$'

# Validate HOST
if [[ -z "${HOST}" ]]; then
    echo "${0} error: HOST is not set"
    exit 1
fi

# Validate PORT
if [[ -z "${PORT}" ]]; then
    echo "${0} error: PORT is not set"
    exit 1
fi

if ! [[ "${PORT}" =~ ${re_number} ]]; then
   echo "${0} error: PORT=>${PORT}< is not a number"
   exit 1
fi

# Validate NODE_API_HOST
if [[ -z "${NODE_API_HOST}" ]]; then
    echo "${0} error: NODE_API_HOST is not set"
    exit 1
fi

# Validate NODE_API_PROTOCOL
if [[ -z "${NODE_API_PROTOCOL}" ]]; then
    echo "${0} error: NODE_API_PROTOCOL is not set"
    exit 1
fi

if [[ "${NODE_API_PROTOCOL}" != "http" && "${NODE_API_PROTOCOL}" != "https" ]]; then
    echo "${0} error: NODE_API_PROTOCOL=>${NODE_API_PROTOCOL}< must be either http or https"
    exit 1
fi

# Validate NODE_API_PORT
if [[ -z "${NODE_API_PORT}" ]]; then
    echo "${0} error: NODE_API_PORT is not set"
    exit 1
fi

if ! [[ "${NODE_API_PORT}" =~ ${re_number} ]]; then
   echo "${0} error: NODE_API_PORT=>${NODE_API_PORT}< is not a number"
   exit 1
fi

# export NODE_OPTIONS="${NODE_OPTIONS} --experimental-transform-types"

# NODE_OPTIONS="" node --env-file=.env node_modules/.bin/envprocessor --mask "^(PROJECT_NAME|FLAG|HOST|VITE_)" public/preprocessed.js
