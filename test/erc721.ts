import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";

describe("Staking", function () {
    let Factory: ContractFactory;
    let erc721: Contract;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;

    const name = 'CryptonERC721', symbol = 'C721';

    beforeEach(async function () {
        Factory = await ethers.getContractFactory("MyERC721");
        [owner, addr1, addr2] = await ethers.getSigners();
        erc721 = await Factory.deploy(name, symbol);

    });

    describe('name', function () {
        it('Should return name of contract', async function () {
            expect(await erc721.connect(owner).name())
                .to.eq(name);
        });
    });

    describe('symbol', function () {
        it('Should return symbol of contract', async function () {
            expect(await erc721.connect(owner).symbol())
                .to.eq(symbol);
        });
    });

    describe('safeMint', function () {
        it('Should assign a token with incremented id to provided address', async function () {
            await erc721.connect(owner).safeMint(addr1.address); 
            expect(await erc721.connect(owner).ownerOf(1))
                .to.eq(addr1.address);
        });
    });

    describe('setTokenURI', function () {
        it('Should correctly set token uri', async function () {
            await erc721.connect(owner).safeMint(addr1.address);
            const uri = 'test uri';
            await erc721.connect(owner).setTokenURI(1, uri);
            // why does the specification allow to set URI from non-owner address ?
            expect(await erc721.connect(addr2).tokenURI(1))
                .to.eq(uri);
        });
    });
});