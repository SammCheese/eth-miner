const { React } = require('powercord/webpack');
const { SwitchItem, TextInput, SliderInput, SelectInput } = require('powercord/components/settings');
const { Button } = require('powercord/components');
const { open: openModal } = require('powercord/modal');

const f = require('./Functions');
const Log = require('./Log');

let x;

const algorithms = [
  {
    label: 'Ethash (ETH)',
    value: 'ethash'
  },
  {
    label: 'Autolykos2 (ERGO)',
    value: 'autolykos2'
  },
  {
    label: 'Etchash (ETH CLASSIC)',
    value: 'etchash'
  },
  {
    label: 'Firopow (FIRO)',
    value: 'firopow'
  },
  {
    label: 'Octopus (CFX)',
    value: 'octopus'
  },
  {
    label: 'Kawpow (RVN)',
    value: 'kawpow'
  },
  {
    label: 'MTP (XZC)',
    value: 'mtp'
  },
  {
    label: 'MTP-tcr (TCR)',
    value: 'mtp-tcr'
  },
  {
    label: 'Progpow (SERO)',
    value: 'progpow'
  },
  {
    label: 'Progpow-veil (VEIL)',
    value: 'progpow-veil'
  },
  {
    label: 'Progpow-veriblock (VBK)',
    value: 'progpow-veriblock'
  },
  {
    label: 'Progpowz (ZANO)',
    value: 'progpowz'
  },
  {
    label: 'Tensority (BTM)',
    value: 'tensority'
  }
];


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
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }


  render() {
    const running = this.props.getSetting('running', false);
    const address = this.props.getSetting('wallet_address', '0x000000000000000000000000000000000000000');
    const pool_url = this.props.getSetting('pool_url', 'stratum+tcp://eu1.ethermine.org:4444');
    const intensity = this.props.getSetting('intensity', '9');
    const algo = this.props.getSetting('algorithm', 'ethash');

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
            ETH
          </div>
          <div className='eth-info'>
            <div className='eth-info-item'>
              {this.state.accepted} Accepted Shares / {this.state.rejected} Rejected Shares
            </div>
            <div className='eth-info-item'>
              Elapsed: {(this.state.timeElapsed / 60 / 60 % 24).toFixed(0)} H {((this.state.timeElapsed / 60 % 60)).toFixed(0)} M {((this.state.timeElapsed) % 60)} S
            </div>
            <div className='eth-info-item'>
              {this.state.hashrate} MH/s  {this.state.temperature}°C
            </div>
          </div>
        </div>
        <div className='miner-buttons'>
          <Button
            size={Button.Sizes.WIDE}
            color={ running ? Button.Colors.RED : Button.Colors.GREEN}
            onClick={() => {
              this.props.toggleSetting('running', false);
              { running ? f.killMiner() : f.startMiner(algo, pool_url, address, intensity); }
            }}>
            {running ? 'Stop' : 'Start'}
          </Button>
          <Button
            size={Button.Sizes.WIDE}
            color={Button.Colors.GREEN}
            onClick={() => { openModal(Log); }}
          >
            Logs
          </Button>
        </div>
        <div className='configuration'>
          <div className='configuration-section'>
            <SelectInput
              value={this.props.getSetting('algorithm', 'ethash')}
              onChange={({ value }) => {
                this.props.updateSetting('algorithm', value);
              }}
              options={algorithms.map(alg => ({
                label: alg.label,
                value: alg.value
              }))}
              required={true}
              disabled={running}
            >
              Algorithm
            </SelectInput>
            <TextInput
              onChange={val => this.props.updateSetting('pool_url', val)}
              defaultValue={this.props.getSetting('pool_url', 'stratum+tcp://eu1.ethermine.org:4444')}
              note='e.g stratum+tpc://eu1.ethermine.org:4444'
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
            <SwitchItem
              value={this.props.getSetting('cuda', false)}
              onChange={() => this.props.toggleSetting('cuda', false)}
              disabled={running}
              note='currently doesnt do anything'
            >
              Use CUDA (NVIDIA Only)
            </SwitchItem>
          </div>
        </div>
      </div>
    );
  }
};
