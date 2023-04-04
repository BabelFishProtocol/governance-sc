
import hh from "hardhat";
import { ModulesProxyInstance, StakingStakeModuleInstance } from "types/generated";
const ethers = (hh as any).ethers;

const deployed = {
  WeightedStakingModule: '0x25CA9Eae39E07F468e22E71Bbd5f91044099c792',
  StakingWithdrawModule: '0xc2E38C3E36b12D52Aa1F45EdC1bbDFC955E243A2',
  StakingAdminModule: '0xF533d1A5271b361C748834f37379a3a746b9A9a2',
  StakingVestingModule: '0xc4A94A28b2D5873180dcA0386362D849645136Db',
  StakingStorageModule: '0x949b4db7fe196DAf94e764635bB223a662bE4ED5',
  StakingGovernanceModule: '0x2e2De586F425CC020C40041672f930088e054720',
  StakingStakeModule: '0xA6b2d8B8864271299F0d3eF27C096Fe546F2034b',
  ModulesProxy: '0x6c0b30F26E8075BC4625C61C40Aace3E48069314',
  StakingProxy: '0x34a01F53432e2105B7361Aee031F3De629eb7211'
};

async function deploy(name: string) {
  if(deployed[name]) {
    console.log('already deployed: ', name);
    const factory = await ethers.getContractFactory(name);
    return await factory.attach(deployed[name]);
  }
  console.log('deploying ', name);
  const factory = await ethers.getContractFactory(name);
  const inst = await factory.deploy();
  console.log('deployed ', name, inst.address);
  return inst;
}

async function deployModules() {

  const names = [
    'StakingAdminModule', 'StakingGovernanceModule', 'StakingStakeModule', 
    'StakingStorageModule', 'StakingVestingModule', 'StakingWithdrawModule',
    'WeightedStakingModule' ];

  const modules = await Promise.all(names.map(name => deploy(name)));

  const modulesProxy = await deploy('ModulesProxy');
  console.log('modulesProxy', modulesProxy.address);

  const moduleAddresses = modules.map(m => m.address);
  console.log('moduleAddresses', moduleAddresses);

  const stakingProxy = await deploy('StakingProxy');

  await stakingProxy.setImplementation(modulesProxy.address);

  const impl = await stakingProxy.getImplementation();
  console.log('impl', impl);

  const factoryModulesProxy = await ethers.getContractFactory('ModulesProxy');
  const fakeModulesProxy = await factoryModulesProxy.attach(stakingProxy.address);

  console.log('1');
  const r = await fakeModulesProxy.addModules(moduleAddresses);
  console.log('2', r);
  await r.wait();
  console.log('3');

  const factoryStakingStakeModule = await ethers.getContractFactory('StakingStakeModule');
  const fakeStakingStakeModule = await factoryStakingStakeModule.attach(stakingProxy.address);
  const r2 = await fakeStakingStakeModule.balanceOf('0x94e907f6B903A393E14FE549113137CA6483b5ef');
  console.log('4', r2);
}

async function main() {
    await deployModules();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
