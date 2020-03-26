[![npm (scoped)](https://img.shields.io/npm/v/@tabcat/ipfs-serve)](https://www.npmjs.com/package/@tabcat/ipfs-serve)
# ipfs-serve
host a static directory over http and ipfs

## Usage
install with npm:
```
npm install @tabcat/encrypted-docstore
```

use in an npm script:
```js
// package.json
"scripts": {
  "serve": "ipfs-serve -r ./build"
}
```

#### Options:
  - -V, --version:         output the version number
  - -d, --debug:           output debug to console
  - -r, --repo <dir>:      root directory of repo to host (default: "./build")
  - -i, --ipfs <address>:  ipfs daemon api address, falls back to a js-ipfs node (default: "js-ipfs")
  - -p, --port <portNum>:  port to host repo on http gateway (default: "3000")
  - --jrepo <dir>:         specify directory of js-ipfs repo (default: process.cwd() + "/ipfs-serve")
  - --joffline:            run js-ipfs offline
  - --no-http:             do not host with http
  - --no-open:             do not open in new browser tab
  - -h, --help:            output usage information
