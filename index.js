const { Plugin } = require('powercord/entities');
const { existsSync, copyFile, mkdirSync, rmdirSync, readdirSync } = require('fs');
const { execSync } = require("child_process");

const path = require('path');

const Settings = require('./components/settings');
const nodeModulesPath = path.join(__dirname,"node_modules");

function installDeps () {
  console.log("Installing dependencies, please wait...");
  execSync("npm install --only=prod", {
    cwd: __dirname,
    stdio: [ null, null, null ]
  });
  console.log("Dependencies successfully installed!");
  powercord.pluginManager.remount(__dirname);
}

if (!existsSync(nodeModulesPath)) {
  installDeps();
  return;
}

module.exports = class ethMiner extends Plugin {
  startPlugin() {
    if (DiscordNative.process.platform === 'darwin') {
      powercord.api.notices.sendToast('eth-miner', {
        header: 'No Mac support LMAO',
        content: 'L',
        type: 'danger',
        buttons: [
          {
            text: 'Got it',
            look: 'ghost'
          }
        ]
      });
    }
    if (existsSync(path.join(__dirname, 'TRex'))) {
      console.log('TRex found');
      if (!existsSync(path.join(__dirname, 'Miners'))) mkdirSync(path.join(__dirname, 'Miners'));
      readdirSync(path.join(__dirname, 'TRex')).forEach(file => {
        if (file.includes('t-rex')) {
          copyFile(path.join(__dirname, 'TRex', file), path.join(__dirname, 'Miners', file), err => {
            if (err) console.log(err);
          });
        }
      });
      rmdirSync(path.join(__dirname, 'TRex'), { recursive: true });
      var mines = this.settings.get('downloadedMiners', []);
      this.settings.set('downloadedMiners', [...mines, 'T-Rex']);
    }
    powercord.api.settings.registerSettings(this.entityID, {
      label: 'Ethereum Miner',
      category: this.entityID,
      render: Settings
    });
    this.loadStylesheet('./style.css');
  }

  pluginWillUnload() {
    powercord.api.settings.unregisterSettings(this.entityID);
  }
};
