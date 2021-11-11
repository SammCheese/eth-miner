const { Plugin } = require('powercord/entities');

const Settings = require('./components/settings');
const f = require('./components/Functions');

module.exports = class ethMiner extends Plugin {
  async startPlugin() {
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
