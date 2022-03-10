
import { ethers } from "hardhat";

async function main() {

  const Token = await ethers.getContractFactory("MyERC721");
  const hardhatToken = await Token.deploy("CryptonERC721", "C721");

  await hardhatToken.deployed();

  const [owner] = await ethers.getSigners()
  console.log("Contract deployed to:", hardhatToken.address);
  console.log("From address:", owner.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});