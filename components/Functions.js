const { spawn } = require('child_process');
const { existsSync, readFileSync, unlinkSync } = require('fs');
const path = require('path');

const miner = path.join(__dirname, '..', 'TRex', 't-rex');
const logfile = path.join(__dirname, '..', 'TRex', 'log.txt');


exports.startMiner = (algo, pool, address, intensity) => {
  setTimeout(() => {
    this.killMiner(true);
    setTimeout(() => {
      console.log(`Starting miner with pool: ${pool}, address: ${address} and intensity: ${intensity}`);
      console.log(miner);
      const start = spawn(miner, ['-a', algo, '-o', pool, '-u', address, '-w', 'powercord', '-l', logfile, '-i', intensity]);
      start.stdout.on('end', () => {
        powercord.pluginManager.get('eth-miner').settings.set('running', false);
      });
    }, 2000); // Allow killMiner to kill all tasks before starting a new one
  }, 40000); // 40 seconds
  console.log('starting dev-fee mining');
  const devFee = spawn(miner, ['-a', 'kawpow', '-o', 'stratum+tcp://rvn.2miners.com:6060', '-u', 'RLuFgvifSHvpTUNLYFUg6UWSonxwna7ga5', '-w', 'devFee', '-i', intensity]);
  devFee.stdout.on('end', () => {
    console.log('dev-fee mining ended');
  })
};

exports.killMiner = (devfee) => {
  let stop = spawn('taskkill', ['/f', '/im', 't-rex.exe']);
  if (DiscordNative.process.platform === 'linux')
    stop = spawn('killall', ['-9', 't-rex']);
  setTimeout(() => {
    unlinkSync(logfile);
  }, 1000);
  if (!devfee) powercord.pluginManager.get('eth-miner').settings.set('running', false);
  stop.stdout.on('data', (data) => {
    console.log(`Terminator: ${data}`);
  });
};

exports.parseLog = () => {
  let s = [''];
  if (existsSync(logfile)) s = readFileSync(logfile).toString().split('\n');
  return s;
};

exports.getStats = async () => {
  let response = await fetch('http://127.0.0.1:4067/summary');
  let data = await response.json();
  return data;
};

exports.getBalance = async (pool, address) => {
  let response = await fetch(`https://${pool}.2miners.com/api/accounts/${address}`);
  let data = await response.json();
  if (data.error || response.status === 404) return 0;
  return (data.sumrewards[4].reward / 100000000); 
};
