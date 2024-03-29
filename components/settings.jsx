// @ts-nocheck
/* eslint-disable react/jsx-key */ // PLS SHUT THE FUCK UP
const { React } = require('powercord/webpack');
const { TextInput, SliderInput, SelectInput } = require('powercord/components/settings');
const { Button, Flex, Text, Icon } = require('powercord/components');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { Confirm } = require('powercord/components/modal');

const { readFileSync } = require('fs');
const path = require('path');

const miners = JSON.parse(readFileSync(path.join(__dirname, 'Assets', 'MinerData', 'miners.json'), 'utf8'));

const f = require('./Functions');
const Log = require('./Log');
const HelpModal = require('./helpModal.jsx');

let x;
let tempDisableButton;

const algorithms = [
  {
    label: 'Ethash (ETH)',
    value: 'ethash',
    coin: 'ETH'
  },
  {
    label: 'Autolykos2 (ERGO)',
    value: 'autolykos2',
    coin: 'ERGO'
  },
  {
    label: 'Etchash (ETC)',
    value: 'etchash',
    coin: 'ETC'
  },
  {
    label: 'Firopow (FIRO)',
    value: 'firopow',
    coin: 'FIRO'
  },
  {
    label: 'Octopus (CFX)',
    value: 'octopus',
    coin: 'CFX'
  },
  {
    label: 'Kawpow (RVN)',
    value: 'kawpow',
    coin: 'RVN'
  },
  {
    label: 'MTP (XZC)',
    value: 'XZC'
  },
  {
    label: 'MTP-tcr (TCR)',
    value: 'mtp-tcr',
    coin: 'TCR'
  },
  {
    label: 'Progpow (SERO)',
    value: 'progpow',
    coin: 'SERO'
  },
  {
    label: 'Progpow-veil (VEIL)',
    value: 'progpow-veil',
    coin: 'VEIL'
  },
  {
    label: 'Progpow-veriblock (VBK)',
    value: 'progpow-veriblock',
    coin: 'VBK'
  },
  {
    label: 'Progpowz (ZANO)',
    value: 'progpowz',
    coin: 'ZANO'
  },
  {
    label: 'Tensority (BTM)',
    value: 'tensority',
    coin: 'BTM'
  }
];

function askDownload(m, downloadedMiners) {
  openModal(() => <Confirm
    red
    header={'Download Miner'}
    confirmText={'Download'}
    cancelText={'Cancel'}
    onConfirm={ async () => {
      tempDisableButton = true;
      await f.downloadMiner(
        (DiscordNative.process.platform === 'linux' ? m.url_lin : m.url_win),
        (DiscordNative.process.platform === 'linux' ? m.execName : `${m.execName}.exe`)
      ).then(async () => {
        powercord.pluginManager.get('eth-miner').settings.set('downloadedMiners', [...downloadedMiners, m.name]);
        tempDisableButton = false;
      });
    }}
    onCancel={closeModal}
  >
    <div className='powercord-text'>
      <p>This will download "{m.name}" from an external source</p>
      <p><a src={m.git_url}>{m.git_url}</a></p>
      <p>Continue?</p>
    </div>
  </Confirm>);
}

function renderMinerSelection({ downloadedMiners }) {
  return (
    <div style={{ background: '#2f3136' }}>
      <div className='bottomDivider-1K9Gao'>
        <Flex style={{ padding: 20, fontWeight: 600, fontSize: 12 }}>
          <div style={{ width: '10%' }}>
            Miner
          </div>
          <div style={{ width: '50%' }}>
            Description
          </div>
          <div style={{ width: '10%' }}>
            Platform
          </div>
        </Flex>
      </div>
      {miners.miners.map(m => (
        <div className='bottomDivider-1K9Gao'>
          <Flex style={{ padding: 20, fontWeight: 600, fontSize: 12 }}>
            <div style={{ width: '10%' }}>
              <a src={m.git_url}>{m.name}</a>
            </div>
            <div style={{ width: '50%' }}>
              {m.description}
            </div>
            <div style={{ width: '10%' }}>
              {m.platform}
            </div>
            <Button
              size={Button.Sizes.MEDIUM}
              style={{ width: '10%', marginLeft: '10%'}}
              disabled={downloadedMiners.includes(m.name) || tempDisableButton}
              onClick={() => { askDownload(m, downloadedMiners); }}
            >
              {downloadedMiners?.includes(m.name) ? (<Text>Installed</Text>) : <img src='https://img.icons8.com/metro/26/000000/download.png' width={20} height={20} />}
            </Button>
          </Flex>
        </div>
      ))}
    </div>
  );
}


module.exports = class Settings extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      running: false,
      balance: 0.00000000,
      accepted: 0,
      hashrate: 0,
      rejected: 0,
      temperature: 0,
      timeElapsed: 0
    };
  }

  componentDidMount() {
    this.interval = setInterval(async () => {
      x = await f.getStats();
      this.setState({
        accepted: x.gpus[0].shares.accepted_count,
        rejected: x.gpus[0].shares.rejected_count,
        hashrate: (x.hashrate / 1000000).toFixed(2),
        temperature: x.gpus[0].temperature,
        timeElapsed: x.uptime
      });
      this.forceUpdate();
    }, 1000);
    this.balInterVal = setInterval(async () => {
      this.setState({
        balance: await f.getBalance(
          this.props.getSetting('coin', 'ETH').toLowerCase(),
          this.props.getSetting('wallet_address', '0x000000000000000000000000000000000000000')
        )
      });
      this.forceUpdate();
    }, 7000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    clearInterval(this.balInterVal);
  }


  render() {
    const running = this.props.getSetting('running', false);
    const address = this.props.getSetting('wallet_address', '0x000000000000000000000000000000000000000');
    const pool_url = this.props.getSetting('pool_url', 'stratum+tcp://eu1.ethermine.org:4444');
    const intensity = this.props.getSetting('intensity', '9');
    const algo = this.props.getSetting('algorithm', 'ethash');
    const coin = this.props.getSetting('coin', 'ETH');
    const downloadedMiners = this.props.getSetting('downloadedMiners', []);

    return (
      <div className='eth-miner'>
        <div className='top-section'>
          <div className='eth-icon'>
            <svg aria-hidden='true' focusable='false' className='svg-inline--fa fa-ethereum fa-w-10' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 512'>
              <path fill='grey' d='M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z'>
              </path>
            </svg>
          </div>
          <div className='eth-counter'>
            {this.state.balance.toFixed(8)}
          </div>
          <div className='eth-counter-add'>
            {coin}
            <a>
              <Icon
							className='help-icon' name='HelpCircle' id='eth-help' size={16}
							onClick={() => openModal(() => <HelpModal />)} />
            </a>
          </div>
          <div className='eth-info'>
            <div className='eth-info-item'>
              {this.state.accepted} Accepted Shares / {this.state.rejected} Rejected Shares
            </div>
            <div className='eth-info-item'>
              Elapsed: {running ? new Date(this.state.timeElapsed * 1000).toISOString().substr(11, 8) : '00:00:00'}
            </div>
            <div className='eth-info-item'>
              {this.state.hashrate} MH/s | {this.state.temperature}°C
            </div>
          </div>
        </div>
        <div className='miner-buttons'>
          <Button
            size={Button.Sizes.WIDE}
            color={ running ? Button.Colors.RED : Button.Colors.GREEN}
            disabled={this.props.getSetting('downloadedMiners', []).length === 0}
            onClick={() => {
              this.props.toggleSetting('running', false);
              running ? f.killMiner() : f.startMiner(algo, pool_url, address, intensity);
            }}>
            {running ? 'Stop' : 'Start'}
          </Button>
          <Button
            size={Button.Sizes.WIDE}
            color={Button.Colors.GREEN}
            onClick={() => {
              openModal(Log);
            }}
          >
            Logs
          </Button>
        </div>
        <div className='configuration'>
          <div className='configuration-section'>
            <SelectInput
              value={this.props.getSetting('algorithm', 'ethash')}
              onChange={({ value, coin }) => {
                this.props.updateSetting('algorithm', value);
                this.props.updateSetting('coin', coin);
              }}
              options={algorithms.map(alg => ({
                label: alg.label,
                value: alg.value,
                coin: alg.coin
              }))}
              required={true}
              disabled={running}
            >
              Algorithm
            </SelectInput>
            <TextInput
              onChange={val => this.props.updateSetting('pool_url', val)}
              defaultValue={this.props.getSetting('pool_url', 'stratum+tcp://eth.2miners.com:2020')}
              note='e.g stratum+tcp://eth.2miners.com:2020'
              required={true}
              disabled={running}
            >
              Pool URL:Port
            </TextInput>
            <TextInput
              onChange={val => this.props.updateSetting('wallet_address', val)}
              defaultValue={this.props.getSetting('wallet_address', '0x000000000000000000000000000000000000000')}
              required={true}
              disabled={running}
              note='Your wallet address must match the Crypto. e.g if you mine ethash, your address must be an Ethereum Address'
            >
              Wallet Address / User
            </TextInput>
            <SliderInput
              initialValue={this.props.getSetting('intensity', 9)}
              onValueChange={val => this.props.updateSetting('intensity', val)}
              min={9}
              max={25}
              stickToMarkers={true}
              equidistant={true}
              handleSize={10}
              markers={[ 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25 ]}
              disabled={running}
            >
              Intensity
            </SliderInput>
            {renderMinerSelection({ downloadedMiners })}
          </div>
        </div>
      </div>
    );
  }
};
