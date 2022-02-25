import { task } from "hardhat/config";
import getErcContract from "./common";
import "@nomiclabs/hardhat-waffle";

task("transferFrom", "Transfer tokens")
    .addParam("contract", 'Address of contract')
    .addParam("caller", "Caller address")
    .addParam("from", "The from account's address")
    .addParam("to", "The to account's address")
    .addParam("amount", "The amount")
    .setAction(async (taskArgs, hre) => {
        const signers =  await hre.ethers.getSigners();
        console.log(taskArgs.from);
        const from = signers.find(signer => {
            console.log(signer.address);
            return signer.address === taskArgs.caller;
        });

        if (from === undefined) {
            throw new Error("'Caller' account not found");
        }
      
        const contract = await getErcContract(hre.ethers, taskArgs.contract);
        await contract.mint(taskArgs.caller, taskArgs.amount);

        return await contract.connect(from).transferFrom(taskArgs.from, taskArgs.to, taskArgs.amount);
  });