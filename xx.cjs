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
    [`transpile`]: {
      command: `
S="\\\\"      
cat <<EEE

/bin/bash transpile.sh select.ts

/bin/bash transpile.sh composition/SelectedListManager.ts

/bin/bash transpile.sh \${S}
  select.ts \${S}
  composition/select-section/SelectedListManager.ts \${S}
  composition/options-section/OptionsListManager.ts \${S}
  composition/select-section/selected-list.ts \${S}
  composition/options-section/options-list.ts \${S}
  js/CenterResizer.ts \${S}
  composition/list-up-down-navi/ListManager.ts \${S}
  composition/manager/SelectManager.ts \${S}
  composition/container/ContainerManager.ts \${S}
  composition/unbind/clickOutside.ts \${S}
  composition/manager/helpers.ts \${S}
  composition/Module.ts \${S}
  js/CenterAndHeightResizer.ts

EEE
      `,
      description: "Transpile choice.js/select.ts to choice.js/select.js",
      source: false,
      confirm: false,
    },
    [`playwright`]: {
      command: `
cat <<EEE

ENVFILE=.env.playwright /bin/bash pw.sh
ENVFILE=.env.playwright /bin/bash pw.sh --target docker

EEE
      `,
      description: "Transpile choice.js/select.ts to choice.js/select.js",
      source: false,
      confirm: false,
    },

    ...setup,
  };
};
