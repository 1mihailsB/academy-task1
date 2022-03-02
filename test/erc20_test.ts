import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";

describe("ERC20", function () {
  let Token: ContractFactory;
  let contract: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  const correctTestValue = 333;
  const nullAddress = '0x0000000000000000000000000000000000000000';

  beforeEach(async function () {
    Token = await ethers.getContractFactory("ERC20");
    [owner, addr1, addr2] = await ethers.getSigners();
    contract = await Token.deploy("ERC20", "Crypton", 18);
  });

  describe("name", function () {
    it("Should return name passed to constructor", async function () {
      expect(await contract.name()).to.equal("ERC20");
    });
  });

  describe("symbol", function () {
    it("Should return symbol passed to constructor", async function () {
      expect(await contract.symbol()).to.equal("Crypton");
    });
  });

  describe("decimals", function () {
    it("Should return decimals passed to constructord", async function () {
      expect(await contract.decimals()).to.equal(18);
    });
  });

  describe("addAdmin", function () {
    it("Should revert if passed address is 0", async function () {
      await expect(contract.connect(owner).addAdmin(nullAddress))
      .to.be.revertedWith('_account must not be zero address');
    });

    it("Should revert if called by non owner", async function () {
      await expect(contract.connect(addr1).addAdmin(addr1.address))
      .to.be.revertedWith('Must be called by owner');
    });

    it("Should add account to admins", async function () {
      await contract.connect(owner).addAdmin(addr1.address);
      expect(await contract.connect(owner).admins(addr1.address))
      .to.equal(true);
      expect(await contract.connect(owner).admins(addr2.address))
      .to.equal(false);
    });
  });

  /**
   * balanceOf() is also covered here
   */
  describe("mint", function () {
    it("Should correctly edit totalSupply and balances", async function () {
      await contract.connect(owner).mint(addr1.address, correctTestValue);
      expect((await contract.connect(owner).totalSupply()).toNumber())
        .to.be.equal(correctTestValue);

      expect((await contract.connect(owner).balanceOf(addr1.address)).toNumber())
        .to.be.equal(correctTestValue);

      expect((await contract.connect(owner).balanceOf(addr2.address)).toNumber())
        .to.be.equal(0);
    });

    it("Should correctly edit totalSupply and balances if called by admin", async function () {
      await contract.connect(owner).addAdmin(addr1.address);
      await contract.connect(addr1).mint(addr1.address, correctTestValue);
      expect((await contract.connect(owner).totalSupply()).toNumber())
        .to.be.equal(correctTestValue);

      expect((await contract.connect(addr1).balanceOf(addr1.address)).toNumber())
        .to.be.equal(correctTestValue);

      expect((await contract.connect(addr1).balanceOf(addr2.address)).toNumber())
        .to.be.equal(0);
    });

    it("Should revert if called by non owner and non admin", async function () {
      await expect(contract.connect(addr1).mint(addr1.address, correctTestValue))
        .to.be.revertedWith('Must be called by owner or admin');
    });

    it("Should revert if passed address is zero", async function () {
      await expect(contract.connect(addr1).mint(nullAddress, correctTestValue))
        .to.be.revertedWith('_account must not be zero address');
    });
  });

  describe("burn", function () {
    it("Should correctly edit totalSupply and balances", async function () {
      await contract.connect(owner).mint(addr1.address, correctTestValue);
      await contract.connect(owner).burn(addr1.address, 20);
      
      expect((await contract.connect(owner).totalSupply()).toNumber())
          .to.be.equal(correctTestValue - 20);

      expect((await contract.connect(owner).balanceOf(addr1.address)).toNumber())
        .to.be.equal(correctTestValue - 20);
    });

    it("Should correctly edit totalSupply and balances if called by admin", async function () {
      await contract.connect(owner).addAdmin(addr1.address);
      await contract.connect(addr1).mint(addr1.address, correctTestValue);
      await contract.connect(addr1).burn(addr1.address, 20);
      
      expect((await contract.connect(addr1).totalSupply()).toNumber())
          .to.be.equal(correctTestValue - 20);

      expect((await contract.connect(addr1).balanceOf(addr1.address)).toNumber())
        .to.be.equal(correctTestValue - 20);
    });

    it("Should revert if called by non owner and non admin", async function () {
      await expect(contract.connect(addr1).burn(addr1.address, correctTestValue))
        .to.be.revertedWith('Must be called by owner or admin');
    });

    it("Should revert if passed address is zero", async function () {
      await expect(contract.connect(addr1).burn(nullAddress, correctTestValue))
        .to.be.revertedWith('_account must not be zero address');
    });

    it("Should revert if burn amount exceeds balance", async function () {
      await expect(contract.connect(owner).burn(addr1.address, correctTestValue))
        .to.be.revertedWith('Burn amount exceeds balance');
    });
  });

  describe("approve", function () {
    it("Should correctly set allowance", async function () {
      await contract.connect(addr1).approve(addr2.address, correctTestValue * 5);
      expect((await contract.connect(owner).allowance(addr1.address, addr2.address)).toNumber())
        .to.equal(correctTestValue * 5);
    });

    it("Should rvert if passed null address", async function () {
      await expect(contract.connect(addr1).approve(nullAddress, correctTestValue * 5))
        .to.be.revertedWith('_for must not be zero address');
    });

    it("Should emit Approval event", async function () {
      await expect(contract.connect(addr1).approve(addr2.address, correctTestValue * 5))
        .to.emit(contract, "Approval")
        .withArgs(addr1.address, addr2.address, correctTestValue * 5);
    });
  });

  describe("increaseAllowance", function () {
    it("Should correctly increase allowance", async function () {
      await contract.connect(addr1).approve(addr2.address, correctTestValue * 5);
      await contract.connect(addr1).increaseAllowance(addr2.address, correctTestValue);

    expect((await contract.connect(owner).allowance(addr1.address, addr2.address)).toNumber())
      .to.equal(correctTestValue * 6);
    });
  });

  describe("decreaseAllowance", function () {
    it("Should correctly decrease allowance", async function () {
      await contract.connect(addr1).approve(addr2.address, correctTestValue * 5);
      await contract.connect(addr1).decreaseAllowance(addr2.address, correctTestValue);

    expect((await contract.connect(owner).allowance(addr1.address, addr2.address)).toNumber())
      .to.equal(correctTestValue * 4);
    });

    it("Should revert if resulting balance below zero", async function () {
      await contract.connect(addr1).approve(addr2.address, correctTestValue * 5);
      await expect(contract.connect(addr1).decreaseAllowance(addr2.address, correctTestValue * 6))
        .to.be.revertedWith('Resulting allowance below zero');
    });
  });

  describe("transfer", function () {
    it("Should revert if passed address is 0", async function () {
      await expect(contract.connect(addr1).transfer(nullAddress, correctTestValue))
        .to.be.revertedWith('_to must not be zero address');
    });

    it("Should revert if amount exceeds balance", async function () {
      await expect(contract.connect(addr1).transfer(addr2.address, correctTestValue))
        .to.be.revertedWith('_amount exceeds balance of _from');
    });

    it("Should revert if passed null address", async function () {
      await expect(contract.connect(addr1).transfer(nullAddress, correctTestValue))
        .to.be.revertedWith('_to must not be zero address');
    });


    it("Should correctly transfer balance", async function () {
      await contract.connect(owner).mint(addr1.address, correctTestValue * 5);
      await contract.connect(addr1).transfer(addr2.address, correctTestValue);

      expect((await contract.connect(owner).balanceOf(addr1.address)).toNumber())
        .to.equal(correctTestValue * 4);

      expect((await contract.connect(owner).balanceOf(addr2.address)).toNumber())
        .to.equal(correctTestValue);
    });

    it("Should emit Transfer event", async function () {
      await contract.connect(owner).mint(addr1.address, correctTestValue * 6);
      await expect(contract.connect(addr1).transfer(addr2.address, correctTestValue * 5))
        .to.emit(contract, "Transfer")
        .withArgs(addr1.address, addr2.address, correctTestValue * 5);
    });
  });

  describe("transferFrom", function () {
    it("Should revert if value exceeds balance", async function () {
      await expect(contract.connect(addr1).transferFrom(addr1.address, addr2.address, correctTestValue))
        .to.be.revertedWith('_value exceeds allowance');
    });

    it("Should correctly edit allowances and balances", async function () {
      await contract.connect(owner).mint(addr1.address, correctTestValue * 6);
      await contract.connect(addr1).approve(addr2.address, correctTestValue * 5);

      await contract.connect(addr2).transferFrom(addr1.address, owner.address,correctTestValue * 4);
      expect((await contract.connect(owner).balanceOf(owner.address)).toNumber())
        .to.be.equal(correctTestValue * 4);

      expect((await contract.connect(owner).balanceOf(addr1.address)).toNumber())
        .to.be.equal(correctTestValue * 2);

      expect((await contract.connect(owner).allowance(addr1.address, addr2.address)).toNumber())
        .to.equal(correctTestValue);
    });

    it("Should fire Transfer event", async function () {
      await contract.connect(owner).mint(addr1.address, correctTestValue * 6);
      await contract.connect(addr1).approve(addr2.address, correctTestValue * 5);

      await expect(contract.connect(addr2).transferFrom(addr1.address, owner.address,correctTestValue * 4))
        .to.emit(contract, "Transfer")
        .withArgs(addr1.address, owner.address, correctTestValue * 4);
    });
  });
});