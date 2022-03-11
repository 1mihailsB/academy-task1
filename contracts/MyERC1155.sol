// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

contract MyERC1155 is ERC1155 {
    constructor(string memory _tokenURI) ERC1155(_tokenURI) {}

    function mint(address to, uint256 id, uint256 amount, bytes memory data) public
    {
        _mint(to, id, amount, data);
    }
}