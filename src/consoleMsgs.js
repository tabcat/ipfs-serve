
'use strict'
const chalk = require('chalk')

const newline = '\n'
const toNotice = (msg) => `\n- ${msg} -${newline}`

const msgKeys = {
  start: 'starting ipfs-serve',
  run: 'running ipfs-serve',
  stop: 'stopping ipfs-serve',
  startfail: 'failed starting ipfs-serve',
  stopfail: 'failed stopping ipfs-serve'
}
const {
  start,
  run,
  stop,
  startfail,
  stopfail
} = msgKeys

const notices = {
  [start]: toNotice(chalk.yellow(start)),
  [run]: toNotice(chalk.green(run)),
  [stop]: toNotice(chalk.yellow(stop)),
  [startfail]: toNotice(chalk.red(startfail)),
  [stopfail]: toNotice(chalk.red(stopfail))
}

const runningInfo = (program, url, server) => {
  const disabled = chalk.grey('disabled')
  return `
repo: ${server.repo}
content id: ${server.cid}
http: ${program.http ? url : disabled}
ipfs node info:
  version: ${server.ipfsInfo.version}
  id: ${server.ipfsInfo.id}
`
}

const logSeperate = (...p) => p.map(v => console.log(v))

module.exports = {
  msgKeys,
  [start]: () => logSeperate(notices[start]),
  [run]: (...p) => logSeperate(notices[run], runningInfo(...p)),
  [stop]: () => logSeperate((notices[stop])),
  [startfail]: (error) => logSeperate(notices[startfail], error),
  [stopfail]: (error) => logSeperate(notices[stopfail], error)
}
