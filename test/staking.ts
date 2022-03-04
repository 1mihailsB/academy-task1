import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";
import { ethers, network } from "hardhat";

describe("Staking", function () {
    let Staking: ContractFactory;
    let staking: Contract;
    let stakingToken: Contract;
    let rewardToken: Contract;
    let StakingToken: ContractFactory;
    let RewardToken: ContractFactory;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
    const rewardTime = 600;
    const rewardPercent = 20; // To sign after point ex. 13.33 % => 1333
    const unstackDelay = 300;

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        Staking = await ethers.getContractFactory("Staking");
        StakingToken = await ethers.getContractFactory("ERC20");
        RewardToken = await ethers.getContractFactory("ERC20");
        [owner, addr1, addr2] = await ethers.getSigners();

        stakingToken = await StakingToken.deploy("ERC20", "ST", 18);
        rewardToken = await RewardToken.deploy("ERC@", "RT", 18);
        
        staking = await Staking.deploy(stakingToken.address, rewardToken.address, rewardTime, rewardPercent, unstackDelay);

        await rewardToken.mint(staking.address, 10000000);
        await rewardToken.mint(addr1.address, 10000000);
        await rewardToken.mint(addr2.address, 10000000);

        await stakingToken.mint(staking.address, 10000000);
        await stakingToken.mint(addr1.address, 10000000);
        await stakingToken.mint(addr2.address, 10000000);
    });

    describe('Stake', function () {
        it('Should revert if value is 0', async function () {
            await expect(staking.connect(addr1).stake(0))
                .to.be.revertedWith('Amount should be bigger 0');
        });

        it('Should add stakes', async function () {
            await stakingToken.connect(addr1).approve(staking.address, 2000);
            await staking.connect(addr1).stake(1000);
            
            expect(await staking.connect(owner).totalStakes())
                .to.equal(1000);
        });

        it('Should claim reward if it is available during stake', async function () {
            await staking.connect(owner).setGlobalfreezeTime(1);
            await staking.connect(owner).setGlobalRewardTime(1);

            await stakingToken.connect(addr1).approve(staking.address, 2000);
            await staking.connect(addr1).stake(1000);

            await(new Promise(resolve => setTimeout(resolve, 3000)));

            const beforeStake = await rewardToken.balanceOf(addr1.address);
            await staking.connect(addr1).stake(1000);
            const afterStake = await rewardToken.balanceOf(addr1.address)
            
            expect(afterStake).gt(beforeStake);
        });
    });

    describe('Unstake', function () {
        it('Should revert if value is 0', async function () {
            await expect(staking.connect(addr1).unstake(0))
                .to.be.revertedWith('Amount should be bigger 0');
        });

        it('Should revert if balance is less than amount', async function () {
            await expect(staking.connect(addr1).unstake(1000))
                .to.be.revertedWith('Your balance less than amoun');
        });

        it("Should revert if freeze time didn't pass", async function () {
            await stakingToken.connect(addr1).approve(staking.address, 2000);
                        
            await staking.connect(addr1).stake(1000);
            
            await expect(staking.connect(addr1).unstake(1000))
                .to.be.revertedWith('Withdraw available after 10 min');

        });

        it('Should correctly return tokens', async function () {
            await staking.connect(owner).setGlobalfreezeTime(1);
            await staking.connect(owner).setGlobalRewardTime(1);
            await stakingToken.connect(addr1).approve(staking.address, 2000);
            
            const beforeStake = await stakingToken.balanceOf(addr1.address);
            
            await staking.connect(addr1).stake(1000);
            
            await(new Promise(resolve => setTimeout(resolve, 3000)));

            await staking.connect(addr1).unstake(1000);
            const afterUnstake = await stakingToken.balanceOf(addr1.address);
            expect(beforeStake).eq(afterUnstake);
        });
    });

    describe('Claim', function () {
        it('Should revert if sender has no rewards', async function () {
            await expect(staking.connect(addr1).claim())
                .to.be.revertedWith('Amount should be bigger 0');
        });

        it('Should reward a correct amount of reward tokens', async function () {
            const testRewardTime = 1;
            const testValue = 1000;
            const waitTime = 4;

            await staking.connect(owner).setGlobalRewardTime(testRewardTime);
            await staking.connect(owner).setGlobalfreezeTime(1);

            await stakingToken.connect(addr1).approve(staking.address, 2000);
            await staking.connect(addr1).stake(testValue);

            await(new Promise(resolve => setTimeout(resolve, testRewardTime * waitTime * 1000)));

            const beforeClaim = await rewardToken.balanceOf(addr1.address);
            await staking.connect(addr1).claim();
            const afterClaim = await rewardToken.balanceOf(addr1.address);
            expect(afterClaim).gt(beforeClaim);
        });
    });

    describe('Only owner', function () {
        it('Should revert if not called by owner', async function () {
            await expect(staking.connect(addr1).setGlobalRewardTime(1))
                .to.be.revertedWith('Not owner');
        });
    });

    describe('Set reward percent', function () {
        it('Should set reward percent', async function () {
            await staking.connect(owner).setGlobalRewardPrecent(200);

            expect(await staking.globalRewardPrecent()).eq(200);
        });
    });
});