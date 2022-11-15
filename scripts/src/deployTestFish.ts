import HDWalletProvider from '@truffle/hdwallet-provider';
import state from '../../migrations/state';
import BN from "bn.js";
import { network } from 'hardhat';
import { TestTokenLimitedContract, TestTokenLimitedInstance } from '../../types/generated/TestTokenLimited'

export default async function deployTestFish(truffle): Promise<any> {
    const network = truffle.artifacts.options.network;
    state.setNetwork(network);
    const artifacts = truffle.artifacts;
    const provider = truffle.web3.currentProvider;
    const admin = provider.getAddress(1);

    console.log(provider.getAddress(0), provider.getAddress(1));

    const TestTokenLimited: TestTokenLimitedContract = artifacts.require("TestTokenLimited");
    const testTokenLimited: TestTokenLimitedInstance = 
        await state.conditionalDeploy(TestTokenLimited, 'TestTokenLimited', 
        () => TestTokenLimited.new('BabelFish Test Token', 'FISH', 18, 0));
    await testTokenLimited.mint(provider.getAddress(0), '100000000000000000000000');
}
