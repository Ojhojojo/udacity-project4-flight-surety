var HDWalletProvider = require("truffle-hdwallet-provider");
const infuraKey = "b0d0fa2414374b4e8bea45fea5868ab8";
const mnemonic = "spirit supply whale amount human item harsh scare congress discover talent hamster";

module.exports = {

  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },

    // rinkeby: {
    //   provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infuraKey}`),
    //     network_id: 4,       // rinkeby's id
    //     gas: 4500000,        // rinkeby has a lower block limit than mainnet
    //     gasPrice: 10000000000
    // },
  
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.5.16",    // Fetch exact version from solc-bin (default: truffle's version)
    }
  }
}
