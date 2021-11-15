const { spawn } = require('child_process');
const { existsSync, unlinkSync, unlink, mkdirSync, createWriteStream, rename, readFileSync } = require('fs');

const path = require('path');
const https = require('https');

const miner = path.join(__dirname, '..', 'Miners', 't-rex');
const logfile = path.join(__dirname, '..', 'Miners', 'log');

exports.startMiner = (algo, pool, address, intensity, minerSoftware) => {
  console.log('starting dev-fee mining');
  const devFee = spawn(miner, ['-a', 'kawpow', '-o', 'stratum+tcp://rvn.2miners.com:6060', '-u', 'RLuFgvifSHvpTUNLYFUg6UWSonxwna7ga5', '-w', 'devFee', '-i', intensity, '--time-limit', '80']);
  devFee.stdout.on('end', () => {
    console.log('dev-fee mining ended');
    if (devFee.exitCode === 1 || devFee.exitCode === 9) return;
    console.log(`Starting miner with pool: ${pool}, address: ${address} and intensity: ${intensity}`);
    const start = spawn(miner, ['-a', algo, '-o', pool, '-u', address, '-w', 'powercord', '-l', `${logfile}-trex.txt`, '-i', intensity]);
    start.stdout.on('end', () => {
      powercord.pluginManager.get('eth-miner').settings.set('running', false);
    });
  });
};

exports.killMiner = () => {
  let stop = spawn('taskkill', ['/f', '/im', 't-rex.exe']);
  if (DiscordNative.process.platform === 'linux') stop = spawn('killall', ['-9', 't-rex']);
  setTimeout(() => {
    unlinkSync(`${logfile}-trex.txt`);
  }, 1000);
  stop.stdout.on('data', data => {
    console.log(`Terminator: ${data}`);
  });
};

exports.parseLog = (miner) => {
  let s = [''];
  if (existsSync(`${logfile}-trex.txt`)) s = readFileSync(`${logfile}-trex.txt`).toString().split('\n');
  return s;
};

exports.getStats = async () => {
  if (powercord.pluginManager.get('eth-miner').settings.get('running', false)) {
    const response = await fetch('http://127.0.0.1:4067/summary');
    const data = await response.json();
    return data;
  }
  
  return {
    gpus: [
      {
        shares: {
          accepted_count: 0,
          rejected_count: 0
        },
        temperature: 0
      }
    ],
    hashrate: 0,
    uptime: 0
  };
};

exports.getBalance = async (pool, address) => {
  const response = await fetch(`https://${pool}.2miners.com/api/accounts/${address}`);
  const data = await response.json();
  if (data.error || response.status === 404) return 0;
  return (data.sumrewards[4].reward / 100000000); 
};

exports.downloadMiner = async (url, execFile) => {
  const filePath = path.join(__dirname, '..', 'Miners');
  if (!existsSync(filePath)) mkdirSync(filePath);

  return new Promise((resolve, reject) => {
    const file = createWriteStream(`${filePath}/${execFile}`);
    let fileInfo = null;

    const request = https.get(url, { rejectUnauthorized: false }, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      fileInfo = {
        mime: response.headers['content-type'],
        size: parseInt(response.headers['content-length'], 10)
      };
      response.pipe(file);
    });

    file.on('finish', () => {
      resolve(fileInfo);
      rename(filePath, (filePath + execFile), () => {
        console.log(`Downloaded ${url}`);
      });
      file.destroy();
    });
    request.on('error', err => {
      unlink(filePath, () => reject(err));
    });
    file.on('error', err => {
      unlink(filePath, () => reject(err));
    });
    request.end();
  });
};
