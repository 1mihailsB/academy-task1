
import { ethers } from "hardhat";

async function main() {

  const Token = await ethers.getContractFactory("ERC20");
  const hardhatToken = await Token.deploy("ERC20", "Crypton", 18);

  await hardhatToken.deployed();

  console.log("Contract deployed to:", hardhatToken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});