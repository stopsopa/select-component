cat <<EEE | podman run -i --rm --ipc host --cap-add SYS_ADMIN --entrypoint="" \
-w "/code" \
--env NODE_API_PORT \
 \
                                             \
-v "$(pwd)/composition:/code/composition"   \
-v "$(pwd)/vite-project:/code/vite-project" \
-v "$(pwd)/dist:/code/dist" \
-v "$(pwd)/test:/code/test" \
                                             \
-v "$(pwd)/package.json:/code/package.json" \
-v "$(pwd)/node_modules:/code/node_modules" \
-v "$(pwd)/playwright-async.config.js:/code/playwright-async.config.js" \
-v "$(pwd)/playwright.config.js:/code/playwright.config.js" \
-v "$(pwd)/playwright.generateBASE_URL.js:/code/playwright.generateBASE_URL.js" \
-v "/Users/szdz/Workspace/STOPSOPA__select-component/STOPSOPA__select-component/.env:/code/.env" \
--env NODE_API_HOST=host.containers.internal \
monstersmart/playwright:v1.59.1-noble-just-chromium \
bash
  set -e
  echo ===========printenv== to see PLAYWRIGHT_TEST_MATCH =========  
  printenv
  echo "pwd: >\$(pwd)<"
  ls -la
  set -x
  npm ls | grep playwright
  ./node_modules/.bin/playwright --version
  node playwright.config.js
  cat <<OOO

value for PLAYWRIGHT_TEST_MATCH >${PLAYWRIGHT_TEST_MATCH}<  
fallback to $(NODE_OPTIONS="" node playwright.config.js | grep testMatch)

  ./node_modules/.bin/playwright test --forbid-only --project=chromium --workers=1 "composition/react/composite-select-demo-attr.e2e.ts" "-g" "loading state" 

OOO
  echo =========== inspect =========== ^^
  ./node_modules/.bin/playwright test --forbid-only --project=chromium --workers=1 "composition/react/composite-select-demo-attr.e2e.ts" "-g" "loading state" 
EEE
