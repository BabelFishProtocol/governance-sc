import HDWalletProvider from '@truffle/hdwallet-provider';
import state from '../../migrations/state';
import BN from "bn.js";
import { network } from 'hardhat';

export default async function upgradeStaking(truffle): Promise<any> {

    const network = truffle.artifacts.options.network;
    state.setNetwork(network);
    const artifacts = truffle.artifacts;
    const provider = truffle.web3.currentProvider;
    const admin = provider.getAddress(1);

    console.log(provider.getAddress(0), provider.getAddress(1));

    const Staking = artifacts.require("Staking");
    const staking = await state.conditionalDeploy(Staking, 'Staking', () => Staking.new());

    const StakingProxy = artifacts.require("StakingProxy");
    const stakingProxy = await state.getDeployed(StakingProxy, 'StakingProxy');

    console.log('New staking: ' + staking.address);

    await stakingProxy.setImplementation(staking.address);
    return;

    if(network == 'rskTestnet') {
        await stakingProxy.setImplementation(staking.address);
    } else if (network == 'rsk') {
        const abi = stakingProxy.contract.methods['setImplementation(address)'](staking.address).encodeABI();
        console.log(abi);
    }

    return;
}

