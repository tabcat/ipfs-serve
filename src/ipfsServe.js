
'use strict'
const { resolve, basename } = require('path')
const fastify = require('fastify')()
const fastifyStatic = require('fastify-static')
const ipfsClient = require('ipfs-http-client')
const { ipfsBundle, globSource } = require('./custom-ipfs')
const all = require('it-all')
const defer = require('p-defer')
const debug = require('./debug')

function ipfsServe (options) {
  const dReady = defer()
  const log = debug(options.debug)

  log('ipfs-serve called with options:')
  log(options)

  const server = {
    ready: dReady.promise,
    repo: resolve(options.repo),
    cid: null,
    port: options.port,
    shutdown: null,
    ipfsInfo: {
      id: null,
      version: null,
      addrs: null
    }
  }
  log('server set to:')
  log(server)

  let shutdownIpfs, shutdownFastify

  const startIpfs = async () => {
    log('setting up ipfs')
    let ipfs
    if (options.ipfs) {
      if (options.ipfs === 'js-ipfs') {
        ipfs = await ipfsBundle({
          repo: resolve(options.jrepo),
          offline: options.joffline
        })
      } else {
        ipfs = ipfsClient(options.ipfs)
      }

      log('hooking up ipfs node')

      const added = await all(
        // pin false so it doesn't keep old versions
        ipfs.add(globSource(server.repo, { recursive: true }))
      )
      log(`added repo ${server.repo} recursively`)
      log('repo contents: [path, content id]')
      log(added.map(add => [add.path, add.cid.toString()]))

      const rootCID = added.filter(v => v.path === basename(options.repo))[0].cid.toString()
      server.cid = rootCID
      log(`set server.cid: ${server.cid}`)

      shutdownIpfs = async () => {
        if (server.cid) {
          await ipfs.pin.rm(server.cid, { recusive: true })
        }
        await ipfs.stop()
      }
      log('setup shutdownIpfs function')

      const [version, id] = await Promise.all([
        ipfs.version(),
        ipfs.id()
        // ipfs.config.get()
      ])
      server.ipfsInfo.version = version.version
      server.ipfsInfo.id = id.id
      log('set server.ipfsInfo')
      log(server.ipfsInfo)

      log('startIpfs complete')
    }
  }

  const startFastify = async () => {
    log('setting up fastify')
    if (options.http) {
      fastify.register(fastifyStatic, { root: server.repo })
      log('registered fastify static route')
      await fastify.listen(options.port)
      log(`fastify listening on port ${options.port}`)

      shutdownFastify = async () => {
        await fastify.close()
      }
      log('setup shutdownFastify')
    }
    log('startFastify complete')
  }

  const start = async () => {
    try {
      log('starting ipfs and fastify')
      await Promise.all([
        startIpfs().catch(e => {
          log('failed to start ipfs')
          throw e
        }),
        startFastify().catch(e => {
          log('failed to start fastify')
          throw e
        })
      ])
      log('started ipfs and fastify')
      dReady.resolve()
    } catch (e) {
      log('shutting down after failed start')
      await shutdown().catch(e => {
        log('failed shutdown after failed start')
        console.error(e)
      })
      dReady.reject(e)
    }
  }

  const shutdown = async () => {
    if (shutdownIpfs) {
      log('shutting down ipfs')
      await shutdownIpfs()
        .then(() => log('successfully shutdown ipfs'))
        .catch(e => {
          console.log(e)
          log('failed to shutdown ipfs')
        })
    }
    if (shutdownFastify) {
      log('shutting down fastify')
      await shutdownFastify()
        .then(() => log('successfully shutdown fastify'))
        .catch(e => {
          console.log(e)
          log('failed to shutdown fastify')
        })
    }
    log('shutdown completed')
  }
  server.shutdown = shutdown

  log('begin start')
  start()

  return server
}

module.exports = ipfsServe
