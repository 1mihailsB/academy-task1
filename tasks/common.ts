export const getErc721Contract = (async (ethers: any, address: string) => {
  const ErcContract = await ethers.getContractFactory('MyERC721');

  return await ErcContract.attach(address);
});

export const getErc1155Contract = (async (ethers: any, address: string) => {
  const ErcContract = await ethers.getContractFactory('MyERC1155');

  return await ErcContract.attach(address);
});