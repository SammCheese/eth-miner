const { Plugin } = require('powercord/entities');
const { existsSync, mkdirSync } = require('fs');
const path = require('path');

const Settings = require('./components/settings');

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
    if (!existsSync(path.join(__dirname, 'TRex'))) {
      mkdirSync(path.join(__dirname, 'TRex'));
      powercord.api.notices.sendToast('eth-miner', {
        header: 'Component Missing!',
        content: 'We couldnt find TRex, an important component, Please download it from here https://github.com/trexminer/T-Rex/releases/ and place the t-rex executable into the eth-miner/TRex Folder',
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
  }
};
