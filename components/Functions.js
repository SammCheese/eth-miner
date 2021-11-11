const { spawn } = require('child_process');
const { existsSync, readFileSync, unlinkSync } = require('fs');
const { https } = require('https');
const path = require('path');

const miner = path.join(__dirname, '..', 'TRex', 't-rex.exe');
const logfile = path.join(__dirname, '..', 'TRex', 'log.txt');


exports.startMiner = (pool, address, intensity) => {
  console.log(`Starting miner with pool: ${pool}, address: ${address} and intensity: ${intensity}`);
  const start = spawn(miner, ['-a', 'ethash', '-o', pool, '-u', address, '-w', 'powercord', '-l', logfile, '-i', intensity]);
  start.stdout.on('end', () => {
    powercord.pluginManager.get('eth-miner').settings.set('running', false);
  });
};

exports.killMiner = () => {
  const stop = spawn('taskkill', ['/f', '/im', 't-rex.exe']);
  setTimeout(() => {
    unlinkSync(logfile);
  }, 1000);
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
}
