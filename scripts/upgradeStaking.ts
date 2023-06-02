
import hh from "hardhat";
import { ModulesProxyInstance, StakingStakeModuleInstance } from "types/generated";
const ethers = (hh as any).ethers;

const deployed = {
  rskTestnet: {
    WeightedStakingModule: '0x25CA9Eae39E07F468e22E71Bbd5f91044099c792',
    StakingWithdrawModule: '0xc2E38C3E36b12D52Aa1F45EdC1bbDFC955E243A2',
    StakingAdminModule: '0xF533d1A5271b361C748834f37379a3a746b9A9a2',
    StakingVestingModule: '0xc4A94A28b2D5873180dcA0386362D849645136Db',
    StakingStorageModule: '0x949b4db7fe196DAf94e764635bB223a662bE4ED5',
    StakingGovernanceModule: '0x2e2De586F425CC020C40041672f930088e054720',
    ModulesProxy: '0x6c0b30F26E8075BC4625C61C40Aace3E48069314',
    StakingProxy: '0x34a01F53432e2105B7361Aee031F3De629eb7211'
  },
  rsk: {
    StakingProxy: '0xFd8ea2e5e8591fA791d44731499cDF2e81CD6a41',
    WeightedStakingModule: '0xC6274e4F5A13E3672feBDAA19Ec753Ca1B7a7A20',
    StakingAdminModule: '0xEFF00E42f6C2f5E9D7D2Debe373E236e7B7C3608',
    StakingStorageModule: '0xe8E8fC76A86Bda186493691006f1D01609b42832',
    StakingStakeModule: '0xC719C88eE06512d2737Fa25093e6e64262fab7AB',
    StakingWithdrawModule: '0xb701e1B7c6C7ACb014f7dF6dD2DF866553Db94d0',
    StakingVestingModule: '0xc642a812522c622814B843a27502D3C9381612a4',
    StakingGovernanceModule: '0xb410eD1536576ed237311D0576895E45f88E6Ef2',
    ModulesProxy: '0xD930AF7bc7f047165514FED024F7458d85957a9F',
    MultiSigWallet: '0x37A706259F5201C03f6Cb556A960F30F86842d01'
  }
};

async function deploy(name: string) {
  const network = hh.network.name;
  if(deployed[network][name]) {
    console.log('already deployed: ', name);
    const factory = await ethers.getContractFactory(name);
    return await factory.attach(deployed[network][name]);
  }
  console.log('deploying ', name);
  const factory = await ethers.getContractFactory(name);
  const inst = await factory.deploy();
  await inst.deployed();
  console.log('deployed ', name, inst.address);
  return inst;
}

async function deployModules() {

  const network = hh.network.name;
  console.log('network', network);

  /*** DEPLOY MODULES ***/

  const names = [
    'StakingAdminModule', 'StakingGovernanceModule', 'StakingStakeModule', 
    'StakingStorageModule', 'StakingVestingModule', 'StakingWithdrawModule',
    'WeightedStakingModule' ];

  const modules = await Promise.all(names.map(name => deploy(name)));

  /*** DEPLOY MODULES PROXY ***/

  const modulesProxy = await deploy('ModulesProxy');

  /*** SET IMPLEMENTATION  ***/

  const factoryModulesProxy = await ethers.getContractFactory('ModulesProxy');
  const stakingProxy = await deploy('StakingProxy');

  const owner = await stakingProxy.getProxyOwner();
  console.log('owner', owner);

  const multiSigWallet = await deploy('MultiSigWallet');
  const owners = await multiSigWallet.getOwners();
  console.log('owners', owners);
  const required = await multiSigWallet.required();
  console.log('required', required);

  const abi1 = stakingProxy.interface.encodeFunctionData(
    "setImplementation",
    [modulesProxy.address]
  );
  console.log('send to staking proxy', stakingProxy.address);
  console.log('abi1 (set implementation)', abi1);

  /*** ADD MODULES  ***/

  const moduleAddresses = modules.map(m => m.address);

  const fakeModulesProxy = await factoryModulesProxy.attach(stakingProxy.address);

  const abi2 = fakeModulesProxy.interface.encodeFunctionData(
    "addModules",
    [moduleAddresses]
  );
  console.log('abi2 (add modules)', abi2);

  /*** UNPAUSE  ***/
 
  const StakingAdminModule = await ethers.getContractFactory('StakingAdminModule');
  const fakeStaking = await StakingAdminModule.attach(stakingProxy.address);
  const abi3 = fakeStaking.interface.encodeFunctionData(
    "pauseUnpause",
    [false]
  );
  console.log('abi3 (unpause)', abi3);
}

async function main() {
    await deployModules();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
