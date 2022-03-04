// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./ERC20.sol";

contract Staking{
    ERC20 public rewardsToken;
    ERC20 public stakingToken;

    uint public globalRewardTime;
    uint public globalRewardPrecent;
    uint public globalfreezeTime;
    address public owner;

    struct UserInfo {
        uint lastUpdateTimes;
        uint rewardUpdateTime;
        uint balance;
        uint rewards;
    }

    mapping(address => UserInfo) private users;
    uint public _totalStakes;

    constructor(address _stakingToken, address _rewardsToken, uint _rewardTime, uint _globalRewardPrecent, uint _globalfreezeTime) {
        stakingToken = ERC20(_stakingToken);
        rewardsToken = ERC20(_rewardsToken);
        globalRewardTime = _rewardTime;
        globalRewardPrecent = _globalRewardPrecent;
        owner = msg.sender;
        globalfreezeTime = _globalfreezeTime;
    }

    modifier updateReward(address account) {
        _calcReward(account);
        _;
    }

    modifier checkFreezeTime() {
        uint withdrawTime = block.timestamp - users[msg.sender].lastUpdateTimes;

        require(withdrawTime >= globalfreezeTime, "Withdraw available after 10 min");
        _;
    } 

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function stake(uint256 _amount) external updateReward(msg.sender) {
        require(_amount > 0, "Amount should be bigger 0");
        if ((users[msg.sender]).rewards > 0) {
            _claim(msg.sender);
        }
        
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        users[msg.sender] = UserInfo(block.timestamp, block.timestamp, _amount, 0);

        _totalStakes += _amount; 
    }

    function unstake(uint256 _amount) external checkFreezeTime updateReward(msg.sender) {
        require(_amount > 0, "Amount should be bigger 0");
        require(users[msg.sender].balance >= _amount, "Your balance less than amount");
        users[msg.sender].balance -= _amount;
        _totalStakes -= _amount;
        stakingToken.transfer(msg.sender, _amount);
    }

    function claim() external {
        _claim(msg.sender);
    }

    function _claim(address sender) internal checkFreezeTime updateReward(sender) {
        require(users[sender].rewards > 0, "Amount should be bigger 0");
        rewardsToken.transfer(sender, users[sender].rewards);
        users[sender].rewards = 0;
    }

    function _calcReward(address _account) internal {
        uint precent = (users[_account].balance * globalRewardPrecent / 100);
        uint timeLeft = block.timestamp - users[_account].rewardUpdateTime;
        uint reward = (timeLeft / globalRewardTime) * precent; 

        if(reward != 0){
            users[_account].rewards += reward;
            users[_account].rewardUpdateTime = block.timestamp;
        }
    }

    function totalStakes() external view returns(uint){
        return _totalStakes;
    }

    function setGlobalRewardTime(uint256 percent) external onlyOwner{
        globalRewardTime = percent;
    }

    function setGlobalRewardPrecent(uint256 percent) external onlyOwner{
        globalRewardPrecent = percent;
    }

    function setGlobalfreezeTime(uint256 percent) external onlyOwner{
        globalfreezeTime = percent;
    } 
}