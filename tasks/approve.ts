import { task } from "hardhat/config";
import getErcContract from "./common";
import "@nomiclabs/hardhat-waffle";

task("approve", "Approve an account's balance")
    .addParam("contract", 'Address of contract')
    .addParam("from", "Caller's account")
    .addParam("to", "Receiver's account")
    .addParam("amount", "The amount")
    .setAction(async (taskArgs, hre) => {
        const signers =  await hre.ethers.getSigners();
        console.log(taskArgs.from);
        const from = signers.find(signer => {
            console.log(signer.address);
            return signer.address === taskArgs.from;
        });

        if (from === undefined) {
            throw new Error("'From' account not found");
        }

        const contract = await getErcContract(hre.ethers, taskArgs.contract);
        return await contract.connect(from).approve(taskArgs.to, taskArgs.amount);
});
