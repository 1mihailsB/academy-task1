const getErcContract = (async (ethers: any, address: string) => {
  const ErcContract = await ethers.getContractFactory('ERC20');

  return await ErcContract.attach(address);
});

const getStakingContract = (async (ethers: any, address: string) => {
  const ErcContract = await ethers.getContractFactory('Staking');

  return await ErcContract.attach(address);
});

export { getErcContract, getStakingContract }
