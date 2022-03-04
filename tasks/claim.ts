import { task } from "hardhat/config";
import { getStakingContract }  from "./common";
import "@nomiclabs/hardhat-waffle";

task("claim", "Claim rewards")
    .addParam("contract", 'Address of contract')
    .addParam("caller", "Caller address")
    .setAction(async (taskArgs, hre) => {
        const signers =  await hre.ethers.getSigners();

        const from = signers.find(signer => {
            return signer.address === taskArgs.caller;
        });

        if (from === undefined) {
            throw new Error("'Caller' account not found");
        }
      
        const contract = await getStakingContract(hre.ethers, taskArgs.contract);

        return await contract.connect(from).claim();
  });