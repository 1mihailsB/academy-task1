
import { ethers } from "hardhat";

async function main() {

  const Token = await ethers.getContractFactory("ERC20");

  const stakingToken = await Token.deploy("ERC20", "ST", 18);
  const rewardToken = await Token.deploy("ERC20", "RT", 18);

  await stakingToken.deployed();
  await rewardToken.deployed();

  console.log("Staking token deployed to:", stakingToken.address);
  console.log("Reward token deployed to:", rewardToken.address);

  const rewardTime = 600;
  const rewardPercent = 20;
  const unstackDelay = 300;

  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(stakingToken.address, rewardToken.address, rewardTime, rewardPercent, unstackDelay);

  await staking.deployed();

  console.log("Staking contrcat deployed to:", staking.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});