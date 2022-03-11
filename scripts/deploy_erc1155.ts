
import { ethers } from "hardhat";

async function main() {

  const Token = await ethers.getContractFactory("MyERC1155");
  const hardhatToken = await Token.deploy("https://ipfs.io/ipfs/QmRkbeG6KY7Vn6bA5249yJHb2kfNvumGK7G9yAsyhvaS6W/{id}.json");

  await hardhatToken.deployed();

  const [owner] = await ethers.getSigners()
  console.log("Contract deployed to:", hardhatToken.address);
  console.log("From address:", owner.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});