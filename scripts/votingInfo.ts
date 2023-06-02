
import hh from "hardhat";
import { ModulesProxyInstance, StakingStakeModuleInstance } from "types/generated";
const ethers = (hh as any).ethers;


async function main() {
    const network = hh.network.name;
    console.log('network', network);

    const GovernorAlpha = await ethers.getContractFactory('GovernorAlpha');
    const governorAlpha = await GovernorAlpha.attach('0xa91b53289375836565ea0c276286561fed555c85');
    const quora = await governorAlpha.quorumVotes();
    console.log('quora', quora);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
