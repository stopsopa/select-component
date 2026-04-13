
set -e

TARGETDIR="vite-project/node_modules"
TGZ="madooei.tar.gz"

mkdir -p "${TARGETDIR}"

rm -rf "${TARGETDIR}/${TGZ}"

rm -rf "${TARGETDIR}/@madooei/"

cp "${TGZ}" "${TARGETDIR}/"

cd "${TARGETDIR}"

tar -zxvf "${TGZ}"

cd ./@madooei/react-example-package/

cat <<EEE

pwd: 
  $(pwd)

find . -type f

EEE

find . -type f