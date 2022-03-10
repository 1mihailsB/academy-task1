const getErc721Contract = (async (ethers: any, address: string) => {
  const ErcContract = await ethers.getContractFactory('MyERC721');

  return await ErcContract.attach(address);
});


export default getErc721Contract;
