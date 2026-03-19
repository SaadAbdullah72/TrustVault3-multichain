import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the Factory (which in turn creates TrustVaultV2 instances)
  const TrustVaultFactory = await ethers.getContractFactory("TrustVaultFactory");
  const factory = await TrustVaultFactory.deploy();

  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log("TrustVaultFactory deployed to:", factoryAddress);
  console.log(`\nTo verify on block explorer (if supported):\nnpx hardhat verify --network <network> ${factoryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
