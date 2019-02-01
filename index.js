
const Core = require('./libs/core');

class Plugin {
  constructor(opts) {
    opts.map((opt) => {
      new Core(opt)
      .onExecute((argv) => {
        return 0;
      })
    })
  }
}

module.exports = Plugin;
