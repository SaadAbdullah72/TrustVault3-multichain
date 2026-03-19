const { execSync } = require("child_process");
const { ethers } = require("ethers");

const pk = "0fe8a7c39be843c3dd7627be59be9d2b0f9d4c526bf35c5808935c1408a0bac5";
const w = new ethers.Wallet(pk);

const rpcs = {
    sepolia: 'https://ethereum-sepolia-rpc.publicnode.com',
    polygonAmoy: 'https://rpc-amoy.polygon.technology',
    bscTestnet: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    arbitrumSepolia: 'https://sepolia-rollup.arbitrum.io/rpc',
    baseSepolia: 'https://sepolia.base.org',
    avalancheFuji: 'https://api.avax-test.network/ext/bc/C/rpc',
    optimismSepolia: 'https://sepolia.optimism.io',
    fantomTestnet: 'https://rpc.testnet.fantom.network',
    cronosTestnet: 'https://evm-t3.cronos.org',
    celoAlfajores: 'https://alfajores-forno.celo-testnet.org',
    gnosisChiado: 'https://rpc.chiadochain.net',
    zksyncSepolia: 'https://sepolia.era.zksync.dev',
    scrollSepolia: 'https://sepolia-rpc.scroll.io',
    lineaSepolia: 'https://rpc.sepolia.linea.build',
    mantleTestnet: 'https://rpc.sepolia.mantle.xyz',
    blastSepolia: 'https://sepolia.blast.io'
};

const withTimeout = (promise, ms) => {
    let timeout;
    const timeoutPromise = new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Timeout')), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeout));
};

async function checkAndDeploy() {
    console.log(`Checking balances for: ${w.address}`);
    const results = {};
    
    const tasks = Object.entries(rpcs).map(async ([net, rpc]) => {
        try {
            const fetchReq = new ethers.FetchRequest(rpc);
            fetchReq.timeout = 2000;
            const provider = new ethers.JsonRpcProvider(fetchReq);
            const balance = await withTimeout(provider.getBalance(w.address), 2500);
            
            if (balance > 0n) {
                console.log(`[FUNDED] ${net}: ${ethers.formatEther(balance)} ETH. Deploying...`);
                try {
                    const out = execSync(`npx hardhat run scripts/deploy.ts --network ${net}`, { stdio: 'pipe' }).toString();
                    const match = out.match(/deployed to: (0x[a-fA-F0-9]{40})/);
                    if (match && match[1]) {
                        console.log(`>>> [SUCCESS] Deployed ${net} at ${match[1]}`);
                        results[net] = match[1];
                    }
                } catch(e) {
                    console.log(`>>> [DEPLOY FAILED] ${net} - Execution Error`);
                }
            } else {
                console.log(`[EMPTY] ${net} has 0 balance.`);
            }
        } catch(e) {
            console.log(`[ERROR / TIMEOUT] ${net}: ${e.message}`);
        }
    });

    await Promise.allSettled(tasks);
    console.log('\n--- DEPLOYMENT SUMMARY ---');
    console.log(JSON.stringify(results, null, 2));
}

checkAndDeploy();
