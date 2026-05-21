// to install go to: https://stopsopa.github.io//pages/bash/index.html#xx

// https://stopsopa.github.io/viewer.html?file=%2Fpages%2Fbash%2Fxx%2Fxx-template.cjs
// edit: https://github.com/stopsopa/stopsopa.github.io/blob/master/pages/bash/xx/xx-template.cjs

// 🚀 -
// ✅ -
// ⚙️  -
// 🗑️  -
// 🛑 -
// to call other xx commands from inside any xx command use:
//    shopt -s expand_aliases && source ~/.bashrc
// after that just do:
//   xx <command_name>

module.exports = (setup) => {
  return {
    help: {
      command: `
set -e  
export NODE_OPTIONS=""
        
cat <<EEE

  🐙 GitHub: $(git ls-remote --get-url origin | awk '{\$1=\$1};1' | tr -d '\\n' | sed -E 's/git@github\\.com:([^/]+)\\/(.+)\\.git/https:\\/\\/github.com\\/\\1\\/\\2/g')

  to explore 3 ways of morph DOM content
    http://0.0.0.0:5678/examples/012-form/

  IMPORTANT:
    for vite setup in vite-project directory
    install in it pnpm install
    and then run from main directory of this project:
      /bin/bash madooei.tar.sh
      that will build directory
      vite-project/node_modules/@madooei/react-example-package
      which is what we are testing in 
        vite-project/src/pages/SelectedSectionDemo.tsx
      and discussing in details in
        https://stopsopa.github.io/pages/typescript/index.rendered.html#:~:text=experimenting%20with%20npm%20package%20exports
          this is from the article: https://madooei.github.io/react-example-package/

EEE

      `,
      description: "Status of all things",
      source: false,
      confirm: false,
    },
    [`server`]: {
      command: `
set -e      
/bin/bash .env.sh      
/bin/bash bash/proc/watchServer.sh server.js -- node --env-file .env --watch server.js
      `,
      description: "Start server",
      source: false,
      confirm: false,
    },
    [`build`]: {
      command: `
set -e      
/bin/bash build.sh
      `,
      description: "Start server",
      source: false,
      confirm: false,
    },
    [`typecheck`]: {
      command: `
set -e      

cat <<EEE

  INFO:
      This will typecheck more then normally is checked during compilation
      Because normally we transpile for npm only what is in 'composition' directory
      but here we are typechecking the whole project

EEE

echo -e "\n  Press enter to continue\n"
read


cat <<EEE

\$ npx tsc -p tsconfig.json

EEE

npx tsc -p tsconfig.json
      `,
      description: "Typecheck entire codebase",
      source: false,
      confirm: false,
    },
    [`transpile`]: {
      command: `

cat <<EEE

  Alternatively use:

      npx tsc -p tsconfig.watch.json --watch

      or:

      /bin/bash tsc-watch.sh
         that will run prettier after each change

      this will have faster fetch but will not have bundling

EEE

/bin/bash tsc-watch.sh

echo "-------------- old method ---------- vvvv"

echo -e "\n      Press enter to continue\n"
read

S="\\\\"      
cat <<EEE

/bin/bash transpile.sh select.ts

/bin/bash transpile.sh composition/SelectedSectionManager.ts

/bin/bash transpile.sh \${S}
  select.ts \${S}
  composition/selected-section/SelectedSectionManager.ts \${S}
  composition/options-section/OptionsSectionManager.ts \${S}
  composition/selected-section/selected-section.ts \${S}
  composition/options-section/options-section.ts \${S}
  js/CenterResizer.ts \${S}
  composition/list-up-down-navi/ListManager.ts \${S}
  composition/composite-select/CompositeManager.ts \${S}
  composition/container/ContainerManager.ts \${S}
  composition/unbind/clickOutside.ts \${S}
  composition/composite-select/helpers.ts \${S}
  composition/composite-select/demo.ts \${S}
  composition/Module.ts \${S}
  js/CenterAndHeightResizer.ts

EEE
      `,
      description: "Transpile choice.js/select.ts to choice.js/select.js",
      source: false,
      confirm: false,
    },
    [`link`]: {
      command: `
set -e      
/bin/bash links.sh
      `,
      description: "Make symlinks to node_modules",
      source: false,
      confirm: false,
    },
    [`npm`]: {
      command: `
set -e
S="\\\\"  

CMD="$(cat <<EOF
/bin/bash bash/swap-files-v2.sh \${S}
  package.json package.dev.json \${S}
  package-lock.json package-lock.dev.json \${S}
  -- npm install
EOF
)"

cat <<EEE

\${CMD}   

EEE

echo -e "\n    Press enter to continue\n"
read

CMD="\${CMD//\\$'\n'/}"

eval "\${CMD}"

`,
      description: `test server`,
      confirm: false,
    },
    [`npm pack`]: {
      command: `
set -e
npm pack
`,
      description: `npm pack`,
      confirm: false,
    },
    [`playwright`]: {
      command: `
cat <<EEE

# run server, then tests then stop server
  ENVFILE=.env.playwright /bin/bash pw.sh
  ENVFILE=.env.playwright /bin/bash pw.sh --target docker

# for continuously running server use  
  /bin/bash playwright.sh -- --debug -- vite-project/src/App.e2e.js

  npx playwright show-report

  ./node_modules/.bin/playwright test --headed --forbid-only --project=chromium --workers=1 

  /bin/bash playwright.sh vite-project/src/App.e2e.ts
  /bin/bash playwright.sh -- vite-project/src/App.e2e.ts
  /bin/bash playwright.sh -- --debug -- vite-project/src/App.e2e.ts

  ./node_modules/.bin/playwright codegen http://0.0.0.0:5678/vite-project/dist/

  /bin/bash playwright.sh -- vite-project/src/App.e2e.ts -g "build list"
  /bin/bash playwright.sh -- --debug -g "build list" -- vite-project/src/App.e2e.ts

EEE
      `,
      description: "Transpile choice.js/select.ts to choice.js/select.js",
      source: false,
      confirm: false,
    },

    [`style:check`]: {
      command: `
set -e
./node_modules/.bin/prettier --config prettier.config.ts --check .
`,
      description: `style_check`,
      confirm: false,
    },
    [`style:fix`]: {
      command: `
set -e
./node_modules/.bin/prettier --config prettier.config.ts --write .
`,
      description: `style_list`,
      confirm: false,
    },
    [`style:list`]: {
      command: `
set -e
./node_modules/.bin/prettier --config prettier.config.ts --list-different .
`,
      description: `style_list`,
      confirm: false,
    },

    ...setup,
  };
};
