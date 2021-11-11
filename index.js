const { Plugin } = require('powercord/entities');
const { existsSync, mkdirSync } = require('fs');

const Settings = require('./components/settings');
const f = require('./components/Functions');

module.exports = class ethMiner extends Plugin {
  startPlugin() {
    if (!existsSync('./TRex')) {
      mkdirSync('./TRex');
      powercord.api.notices.sendToast('eth-miner', {
        header: 'Component Missing!',
        content: 'We couldnt find TRex, an important component, Please download it from here https://github.com/trexminer/T-Rex/releases/ and place the t-rex.exe into the eth-miner/TRex Folder',
        type: 'danger',
        buttons: [
          {
            text: 'Got it',
            look: 'ghost'
          }
        ]
      });
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
    f.killMiner();
  }
};
