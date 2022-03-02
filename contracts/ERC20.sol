// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract ERC20 {
    address private owner;
    mapping (address => bool) public admins;
    string public name;
    string public symbol;
    uint8 public decimals;
    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint)) public allowances;
    uint256 public totalSupply;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        owner = msg.sender;
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    function addAdmin(address _account) external returns (bool) {
        require(msg.sender == owner, "Must be called by owner");
        require(_account != address(0), "_account must not be zero address");
        admins[_account] = true;
        return admins[_account];
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function approve(address _for, uint256 _value) public returns (bool) {
        iApprove(msg.sender, _for, _value);
        return true;
    }

    function iApprove(address _owner, address _for, uint256 _value) internal {
        require(_for != address(0), "_for must not be zero address");

        allowances[_owner][_for] = _value;
        emit Approval(_owner, _for, _value);
    }

    function iTransfer(address _from, address _to, uint256 _amount) internal {
        require(_to != address(0), "_to must not be zero address");
        require(balances[_from] >= _amount, "_amount exceeds balance of _from");

        balances[_from] = balances[_from] - _amount;
        balances[_to] += _amount;

        emit Transfer(_from, _to, _amount);
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        iTransfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        uint256 relevantAllowance = allowances[_from][msg.sender];
        require(relevantAllowance >= _value, "_value exceeds allowance");
        
        iApprove(_from, msg.sender, relevantAllowance - _value);

        iTransfer(_from, _to, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowances[_owner][_spender];
    }


    function increaseAllowance(address _for, uint256 _value) public returns (bool) {
        iApprove(msg.sender, _for, allowances[msg.sender][_for] + _value);
        return true;
    }

    function decreaseAllowance(address _for, uint256 _value) public returns (bool) {
        require(allowances[msg.sender][_for] >= _value, "Resulting allowance below zero");

        iApprove(msg.sender, _for, allowances[msg.sender][_for] - _value);

        return true;
    }

    function mint(address _account, uint256 _value) external {
        require(_account != address(0), "_account must not be zero address");
        require((msg.sender == owner || admins[msg.sender] == true), "Must be called by owner or admin");
        totalSupply += _value;
        balances[_account] += _value;
    }

    function burn(address _account, uint256 _value) external returns (bool) {
        require(_account != address(0), "_account must not be zero address");
        require((msg.sender == owner || admins[msg.sender] == true), "Must be called by owner or admin");
        require(balances[_account] >= _value, "Burn amount exceeds balance");
        balances[_account] = balances[_account] - _value;
        totalSupply -= _value;

        return true;
    }
}