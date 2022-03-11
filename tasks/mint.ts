import { task } from "hardhat/config";
import { getErc721Contract, getErc1155Contract }  from "./common";
import "@nomiclabs/hardhat-waffle";

task("mint", "Mint an ERC717 token")
    .addParam("contract", 'Address of contract')
    .addParam("from", 'Address of caller')
    .addParam("to", "Caller's account")
    .setAction(async (taskArgs, hre) => {
        const signers =  await hre.ethers.getSigners();

        const from = signers.find(signer => {
            return signer.address === taskArgs.from;
        });

        if (from === undefined) {
            throw new Error("'From' account not found");
        }

        const contract = await getErc721Contract(hre.ethers, taskArgs.contract);
        return await contract.connect(from).safeMint(taskArgs.to);
});

task("mint1155", "Mint an ERC1155 token")
    .addParam("contract", 'Address of contract')
    .addParam("from", 'Address of caller')
    .addParam("to", "Caller's account")
    .addParam("id", "Token id")
    .addParam("amount", "Amount of tokens")
    .setAction(async (taskArgs, hre) => {
        const signers =  await hre.ethers.getSigners();

        const from = signers.find(signer => {
            return signer.address === taskArgs.from;
        });

        if (from === undefined) {
            throw new Error("'From' account not found");
        }

        const contract = await getErc1155Contract(hre.ethers, taskArgs.contract);
        return await contract.connect(from).mint(taskArgs.to, taskArgs.id, taskArgs.amount, 0);
});