import HDWalletProvider from '@truffle/hdwallet-provider';
import state from '../../migrations/state';
import BN from "bn.js";
import { network } from 'hardhat';
import { TestTokenLimitedContract, TestTokenLimitedInstance } from 'types/generated/TestTokenLimited';
import { VestingRegistryContract, VestingRegistryInstance } from 'types/generated/VestingRegistry';
import { VestingFactoryContract, VestingFactoryInstance } from 'types/generated/VestingFactory';
import { VestingLogicContract, VestingLogicInstance } from 'types/generated/VestingLogic';
import { StakingProxyContract, StakingProxyInstance } from 'types/generated/StakingProxy';
import { StakingContract, StakingInstance } from 'types/generated/Staking';
import { GovernorAlphaContract, GovernorAlphaInstance, TimelockContract, TimelockInstance, VestingRegistry3Contract, VestingRegistry3Instance } from 'types/generated';


export default async function deployTestFish(truffle): Promise<any> {
    const network = truffle.artifacts.options.network;
    state.setNetwork(network);
    const artifacts = truffle.artifacts;
    const provider = truffle.web3.currentProvider;
    const admin = provider.getAddress(0);

    console.log(provider.getAddress(0), provider.getAddress(1));

    const TestTokenLimited: TestTokenLimitedContract = artifacts.require("TestTokenLimited");
    const token =
        await state.conditionalDeploy(TestTokenLimited, 'TestTokenLimited',
            () => TestTokenLimited.new('BabelFish Test Token', 'FISH', 18, 0));

    const VestingLogic: VestingLogicContract = artifacts.require("VestingLogic");
    const vestingLogic =
        await state.conditionalDeploy(VestingLogic, 'VestingLogic',
            () => VestingLogic.new());

    const VestingFactory: VestingFactoryContract = artifacts.require("VestingFactory");
    const vestingFactory =
        await state.conditionalDeploy(VestingFactory, 'VestingFactory',
            () => VestingFactory.new(vestingLogic.address));

    const Staking: StakingContract = artifacts.require("Staking");
    const staking =
        await state.conditionalDeploy(Staking, 'Staking',
            () => Staking.new());

    const Timelock: TimelockContract = artifacts.require("Timelock");
    const timelock =
        await state.conditionalDeploy(Timelock, 'Timelock',
            () => Timelock.new(admin, 3 * 60 * 60));

    const VestingRegistry3: VestingRegistry3Contract = artifacts.require("VestingRegistry3");
    const vestingRegistry3 =
        await state.conditionalDeploy(VestingRegistry3, 'VestingRegistry3',
            () => VestingRegistry3.new(
                vestingFactory.address,
                token.address,
                staking.address,
                '0x0000000000000000000000000000000000000001',
                timelock.address
            ));

    const StakingProxy: StakingProxyContract = artifacts.require("StakingProxy");
    const stakingProxy =
        await state.conditionalDeploy(StakingProxy, 'StakingProxy',
            () => StakingProxy.new(token.address));

    await stakingProxy.setImplementation(staking.address);

    const GovernorAlpha: GovernorAlphaContract = artifacts.require("GovernorAlpha");
    const governorAlpha =
        await state.conditionalDeploy(GovernorAlpha, 'GovernorAlpha',
            () => GovernorAlpha.new(
                timelock.address,
                staking.address,
                admin,
                60,
                90));
}
