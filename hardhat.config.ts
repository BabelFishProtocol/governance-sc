require("hardhat-typechain");
require("@nomiclabs/hardhat-ethers");

const testnetAccounts = {
    mnemonic: "chimney toss kit now firm true scan laundry hazard buffalo tiny west",
    path: "m/44'/60'/0'/0",
    initialIndex: 0,
    count: 20,
    passphrase: "",
};

const mainnetAccounts = {
    mnemonic: "",
    path: "m/44'/60'/0'/0",
    initialIndex: 0,
    count: 20,
    passphrase: "",
};

export default {
    networks: {
        hardhat: { allowUnlimitedContractSize: true },
        localhost: { url: "http://localhost:87545" },
        rskTestnet: {
            url: "https://public-node.testnet.rsk.co/",
            accounts: testnetAccounts,
            chainId: 31,
            confirmations: 4,
            gasMultiplier: 1.25,
            tags: ["testnet"],
            //timeout: 20000, // increase if needed; 20000 is the default value
            //allowUnlimitedContractSize, //EIP170 contrtact size restriction temporal testnet workaround
        },
        rsk: {
            url: "https://public-node.rsk.co/",
            accounts: mainnetAccounts,
            chainId: 30,
            confirmations: 4,
            gasMultiplier: 1.25,
            tags: ["mainnet"],
        },
    },
    solidity: {
        version: "0.5.17",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            },
        },
    },
    paths: { artifacts: "./build/contracts" },
    gasReporter: {
        currency: "USD",
        gasPrice: 30,
    },
    mocha: {
        timeout: 240000, // 4 min timeout
    },
    typechain: {
        outDir: "types/generated",
        target: "truffle-v5",
    },
    tenderly: {
        username: "mStable",
        project: "mStable-contracts",
    },
};
