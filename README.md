# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:

`npm install`
`truffle compile`

## Develop Client

To run truffle tests:

`truffle test ./test/flightSurety.js`
`truffle test ./test/oracles.js`

To use the dapp:

`truffle migrate`
`npm run dapp`

To view dapp:

`http://localhost:8000`

## Develop Server

`npm run server`
`truffle test ./test/oracles.js`

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder


### Versions Used
Ganache CLI v6.12.2 (ganache-core: 2.13.2)

Truffle v5.4.6 (core: 5.4.6)

Solidity v0.5.16 (solc-js)

Node v15.14.0

Web3.js v1.5.1

<br>

### Contract on Rinkeby Network: 
0x79ad8de67fbf1699f16b6aef06d57fea8c68f7d0
### Transaction on Rinkeby Network: 
0x0d970056e8321919415141c47d03789317fe97608e2ddb97d7843d6f363f091d
### https://rinkeby.etherscan.io/address/0x79ad8de67fbf1699f16b6aef06d57fea8c68f7d0

<br>

## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)