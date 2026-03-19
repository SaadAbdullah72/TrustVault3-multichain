import { ethers, network } from "hardhat";
import hre from "hardhat";

async function main() {
    const networksToDeploy = [
        "ethereumSepolia", "polygonAmoy", "bscTestnet", "arbitrumSepolia",
        "baseSepolia", "avalancheFuji", "optimismSepolia", "fantomTestnet",
        "cronosTestnet", "celoAlfajores", "gnosisChiado", "zkSyncSepolia",
        "scrollSepolia", "lineaSepolia", "mantleTestnet", "blastSepolia"
    ];

    const results: Record<string, string> = {};

    // In Hardhat, you cannot easily loop networks in one script execution because 
    // the provider is bound to the `--network` flag. 
    // However, we can use standard ethers.js JSON-RPC providers to check balances manually 
    // or we can just instruct the agent to run the deployment for specific networks via bash loop.
    console.log("This script is meant to be run via bash loop. Current Network:", network.name);
    
    try {
        const [deployer] = await ethers.getSigners();
        console.log(`\n--- Deploying to ${network.name} ---`);
        console.log("Account:", deployer.address);
        
        const balance = await ethers.provider.getBalance(deployer.address);
        console.log("Balance:", ethers.formatEther(balance));

        if (balance === 0n) {
            console.log(`[SKIP] Insufficient funds on ${network.name}.`);
            return;
        }

        const TrustVaultFactory = await ethers.getContractFactory("TrustVaultFactory");
        const factory = await TrustVaultFactory.deploy();
        await factory.waitForDeployment();
        const address = await factory.getAddress();
        
        console.log(`[SUCCESS] Deployed to ${network.name} at: ${address}`);
    } catch (e: any) {
        console.log(`[ERROR] Failed on ${network.name}:`, e.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
