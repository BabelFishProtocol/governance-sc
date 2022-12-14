require('ts-node/register')
// OPTIONAL: Allows the use of tsconfig path mappings with ts-node
require('tsconfig-paths/register')

const HDWalletProvider = require('@truffle/hdwallet-provider')

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!

  migrations_directory: './migrations',
  contracts_build_directory: './build/contracts',
  plugins: ['solidity-coverage', 'truffle-plugin-verify'],
  api_keys: {
    etherscan: ''
  },
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*', // Match any network id
      gas: 1000000000000000,
      gasPrice: 0x01
    },
    fork: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*', // Match any network id
      gas: 8000000
    },
    coverage: {
      host: "127.0.0.1",
      port: 7546,
      network_id: "*",
      gas: 0xfffffffffff, // <-- Use this high gas value
      gasPrice: 0x01      // <-- Use this low gas price
    },
    ropsten: {
      provider() {
        return new HDWalletProvider("seek danger physical menu pen arrest clutch blade weird detect digital frog",
            `wss://ropsten.infura.io/ws/v3/42af85fbc97845a0974cbbf003834c28`, 0, 3)
      },
      network_id: 3,
      gasPrice: 1000000000, // 100 GWei,
      skipDryRun: true,
      gas: 70000000
    },
    kovan: {
      provider() {
        return new HDWalletProvider("seek danger physical menu pen arrest clutch blade weird detect digital frog",
            "wss://kovan.infura.io/ws/v3/42af85fbc97845a0974cbbf003834c28", 0, 42)
      },
      network_id: 42,
      gasPrice: 20000000000, // 20 GWei,
      skipDryRun: true,
      gas: 2000000
    },
    rskTestnet: {
      provider() {
        return new HDWalletProvider('chimney toss kit now firm true scan laundry hazard buffalo tiny west',
            //'https://testnet.sovryn.app/rpc',
            'https://public-node.testnet.rsk.co',
            0, 31)
      },
      network_id: 31,
      gasPrice: 100000000,
      skipDryRun: false,
      networkCheckTimeout: 1e9,
      gas: 6800000
    },
    rsk: {
      provider() {
        return new HDWalletProvider('receive nasty...',
            'https://public-node.rsk.co', 0, 31)
      },
      network_id: 30,
      gasPrice: 100000000,
      skipDryRun: true,
      networkCheckTimeout: 1e9
    },
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      currency: 'USD'
    }
  },
  compilers: {
    solc: {
      version: '0.5.17',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
}
