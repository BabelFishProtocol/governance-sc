import HDWalletProvider from '@truffle/hdwallet-provider';
import state from '../../migrations/state';
import BN from "bn.js";

export default async function upgradeStaking(truffle): Promise<any> {

    state.setNetwork(truffle.artifacts.options.network);
    const artifacts = truffle.artifacts;
    const provider = truffle.web3.currentProvider;
    const admin = provider.getAddress(1);

    console.log(provider.getAddress(0), provider.getAddress(1));

    const Staking = artifacts.require("Staking");
    const fake = await state.getDeployed(Staking, 'StakingProxy');

    const stakes = await fake.getStakes(provider.getAddress(0));
    //console.log(stakes);
    console.log(
        stakes.dates.map(s => new Date((s as BN).toNumber()*1000)), 
        stakes.stakes.map(s => ''+s));
    //await fake.extendStakingDuration()

    return;
}

