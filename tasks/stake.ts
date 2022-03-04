import { task } from "hardhat/config";
import { getStakingContract } from "./common";
import "@nomiclabs/hardhat-waffle";

task("stake", "Stake coins")
    .addParam("contract", 'Address of contract')
    .addParam("caller", "Caller address")
    .addParam("amount", "The amount")
    .setAction(async (taskArgs, hre) => {
        const signers =  await hre.ethers.getSigners();

        const from = signers.find(signer => {
            return signer.address === taskArgs.caller;
        });

        if (from === undefined) {
            throw new Error("'Caller' account not found");
        }
      
        const contract = await getStakingContract(hre.ethers, taskArgs.contract);

        return await contract.connect(from).stake(taskArgs.amount);
  });