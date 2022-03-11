import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";

describe("ERC1155", function () {
    let Factory: ContractFactory;
    let erc1155: Contract;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;

    const uri = "testUri";

    beforeEach(async function () {
        Factory = await ethers.getContractFactory("MyERC1155");
        [owner, addr1, addr2] = await ethers.getSigners();
        erc1155 = await Factory.deploy(uri);
    });

    describe('mint', function () {
        it('Should return uri set by constructor', async function () {
            await erc1155.connect(owner).mint(addr1.address, 1, 1, 1);
            
            const balance = await erc1155.connect(owner).balanceOf(addr1.address, 1);
            expect(balance).eq(1);
        });
    });   

    describe('uri', function () {
        it('Should return uri set by constructor', async function () {
            expect(await erc1155.connect(owner).uri(1))
                .to.eq(uri);
        });
    });    
});