
import hh from "hardhat";
import _ from "lodash";
import { ModulesProxyInstance, ProxyInstance, StakingAdminModuleInstance } from "types/generated";
const ethers = (hh as any).ethers;

const deployed = {
    rskTestnet: {
        StakingProxy: '0x34a01F53432e2105B7361Aee031F3De629eb7211',
        ModulesProxy: '0x6c0b30F26E8075BC4625C61C40Aace3E48069314',
        WeightedStakingModule: '0x25CA9Eae39E07F468e22E71Bbd5f91044099c792',
        StakingWithdrawModule: '0xc2E38C3E36b12D52Aa1F45EdC1bbDFC955E243A2',
        StakingAdminModule: '0xF533d1A5271b361C748834f37379a3a746b9A9a2',
        StakingVestingModule: '0xc4A94A28b2D5873180dcA0386362D849645136Db',
        StakingStorageModule: '0x949b4db7fe196DAf94e764635bB223a662bE4ED5',
        StakingGovernanceModule: '0x2e2De586F425CC020C40041672f930088e054720',
        StakingStakeModule: '0xf4b7BC65CE318E119A2Ac16802Db6d0dD9Bf0766',
    },
    rsk: {
        StakingProxy: '0xFd8ea2e5e8591fA791d44731499cDF2e81CD6a41',
        ModulesProxy: '0xD930AF7bc7f047165514FED024F7458d85957a9F',
        WeightedStakingModule: '0xC6274e4F5A13E3672feBDAA19Ec753Ca1B7a7A20',
        StakingAdminModule: '0xEFF00E42f6C2f5E9D7D2Debe373E236e7B7C3608',
        StakingStorageModule: '0xe8E8fC76A86Bda186493691006f1D01609b42832',
        StakingStakeModule: '0xC719C88eE06512d2737Fa25093e6e64262fab7AB',
        StakingWithdrawModule: '0xb701e1B7c6C7ACb014f7dF6dD2DF866553Db94d0',
        StakingVestingModule: '0xc642a812522c622814B843a27502D3C9381612a4',
        StakingGovernanceModule: '0xb410eD1536576ed237311D0576895E45f88E6Ef2',
        MultiSigWallet: '0x37A706259F5201C03f6Cb556A960F30F86842d01'
    }
};

async function deployModules() {

    const network = hh.network.name;
    console.log('network', network);

    const stakingProxyAddress = deployed[network]['StakingProxy'];

    const proxyFactory = await ethers.getContractFactory('Proxy');
    const proxy = await proxyFactory.attach(stakingProxyAddress);
    const owner = await (proxy as ProxyInstance).getProxyOwner();
    console.log('owner: ', owner);

    return;


    const stakingStakeModuleFactory = await ethers.getContractFactory('StakingStakeModule');
    const stakingStakeModule = await stakingStakeModuleFactory.deploy();
    await stakingStakeModule.deployed();

    console.log('new stakingStakeModule address: ', stakingStakeModule.address);

    const modulesProxyfactory = await ethers.getContractFactory('ModulesProxy');
    const modulesProxyFake = await modulesProxyfactory.attach(stakingProxyAddress);

    { 
        const isRegisteredNew = await (modulesProxyFake as ModulesProxyInstance).isModuleRegistered(stakingStakeModule.address);
        console.log('isRegisteredNew: ', isRegisteredNew);
    }

    const clashing = await (modulesProxyFake as ModulesProxyInstance).checkClashingFuncSelectors(stakingStakeModule.address);
    console.log('clashing: ', clashing);

    console.log('replacing module...');
    
    if(network == 'rskTestnet') {
        const oldStakingStakeAddress = clashing[0][0];
        console.log('oldStakingStakeAddress: ', oldStakingStakeAddress);

        if(oldStakingStakeAddress) {
            const tx = await (modulesProxyFake as ModulesProxyInstance).replaceModule(
                oldStakingStakeAddress,
                stakingStakeModule.address
            );
            await tx.wait(); 
        } else {
            const tx = await (modulesProxyFake as ModulesProxyInstance).addModule(
                stakingStakeModule.address
            );            
            await tx.wait(); 
        }

    } else {
        const oldStakingStakeAddress = clashing[0][0];
        console.log('oldStakingStakeAddress: ', oldStakingStakeAddress);

        const fakeStaking = await modulesProxyfactory.attach(stakingProxyAddress);
        const abi3 = fakeStaking.interface.encodeFunctionData(
          "replaceModule",
          [ oldStakingStakeAddress, stakingStakeModule.address ]
        );
        console.log('abi3 (replace)', abi3);
    }

    console.log('done');

    {
        const isRegisteredNew = await (modulesProxyFake as ModulesProxyInstance).isModuleRegistered(stakingStakeModule.address);
        console.log('isRegisteredNew: ', isRegisteredNew);
    }

    const stakingAdminModuleFactory = await ethers.getContractFactory('StakingAdminModule');
    const stakingAdminModuleFake = await stakingAdminModuleFactory.attach(stakingProxyAddress);

    const paused = await (stakingAdminModuleFake as StakingAdminModuleInstance).paused();

    console.log('isPaused: ', paused);

    if (paused) {
        if(network == 'rskTestnet') {
            console.log('unpausing...');
            await (stakingAdminModuleFake as StakingAdminModuleInstance).pauseUnpause(false);
            console.groupCollapsed('done');
        } else {
            const fakeStaking = await stakingAdminModuleFactory.attach(stakingProxyAddress);
            const abi3 = fakeStaking.interface.encodeFunctionData(
              "pauseUnpause",
              [ false ]
            );
            console.log('abi3 (unpause)', abi3);
        }
    }
}

async function main() {
    await deployModules();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
