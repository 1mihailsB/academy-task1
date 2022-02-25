const getErcContract = (async (ethers: any, address: string) => {
  const ErcContract = await ethers.getContractFactory('ERC20');

  return await ErcContract.attach(address);
});

export default getErcContract;