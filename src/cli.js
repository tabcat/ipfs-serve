#! /usr/bin/env node

'use strict'
require('make-promises-safe')
const commander = require('commander')
const open = require('open')
const ipfsServe = require('./index')

const {
  msgKeys: { start, run, stop, startfail, stopfail },
  ...consoleMsgs
} = require('./consoleMsgs')
const debug = require('./debug')

const program = new commander.Command()
program.version('1.0.0')

program /*  d r i p  */
  .option('-d, --debug', 'output debug to console')
  .option('-r, --repo <dir>', 'root directory of repo to host', './build')
  .option('-i, --ipfs <address>', 'ipfs daemon api address, falls back to a js-ipfs node', 'js-ipfs')
  .option('-p, --port <portNum>', 'port to host repo on http gateway', '3000')
  // .option('--no-ipfs', 'do not host with ipfs')
  .option('--jrepo <dir>', 'specify directory of js-ipfs repo', `${process.cwd()}/ipfs-serve`)
  .option('--joffline', 'run js-ipfs offline')
  .option('--no-http', 'do not host with http')
  .option('--no-open', 'do not open in new browser tab')

program.parse(process.argv)

const log = debug(program.debug)
log('debugging enabled')

const options = {
  debug: program.debug,
  repo: program.repo,
  ipfs: program.ipfs,
  port: program.port,
  http: program.http,
  jrepo: program.jrepo,
  joffline: program.joffline
}

async function main () {
  consoleMsgs[start]()
  const server = ipfsServe(options)

  const onError = (msgKey) => (e) => {
    consoleMsgs[startfail](e)
    process.exit(1)
  }

  const exitProcess = async (cb) => {
    consoleMsgs[stop]()
    if (server.shutdown) {
      await server.shutdown()
        .catch(onError(stopfail))
    }

    process.exit(0)
  }

  Promise.race([
    new Promise(resolve => process.on('SIGTERM', () => resolve())),
    new Promise(resolve => process.on('SIGINT', () => resolve()))
  ]).then(() => exitProcess())

  await server.ready
    .then(async () => {
      const url = `http://localhost:${server.port}/`

      consoleMsgs[run](program, url, server)

      if (program.open && program.http) await open(url)
    })
    .catch(onError(startfail))
}
main()
