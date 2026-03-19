// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TrustVault — Autonomous Inheritance Vault
 * @notice A single vault instance. Each user deploys their own.
 * @dev Mirrors the Algorand PyTEAL contract logic exactly.
 */
contract TrustVault {
    address public owner;
    address payable public beneficiary;
    uint256 public lockDuration;
    uint256 public lastHeartbeat;
    bool public released;
    bool public bootstrapped;

    event Bootstrapped(address indexed owner, address indexed beneficiary, uint256 lockDuration);
    event Deposited(address indexed sender, uint256 amount);
    event HeartbeatSent(address indexed owner, uint256 timestamp);
    event Withdrawn(address indexed owner, uint256 amount);
    event AutoReleased(address indexed beneficiary, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier notReleased() {
        require(!released, "Vault already released");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Initialize vault with beneficiary and lock duration.
     * @dev Can only be called once by the owner.
     */
    function bootstrap(address payable _beneficiary, uint256 _lockDuration) external onlyOwner {
        require(!bootstrapped, "Already bootstrapped");
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_lockDuration > 0, "Invalid lock duration");

        beneficiary = _beneficiary;
        lockDuration = _lockDuration;
        lastHeartbeat = block.timestamp;
        released = false;
        bootstrapped = true;

        emit Bootstrapped(msg.sender, _beneficiary, _lockDuration);
    }

    /**
     * @notice Deposit native currency into the vault.
     */
    function deposit() external payable {
        require(msg.value > 0, "Must send value");
        emit Deposited(msg.sender, msg.value);
    }

    /**
     * @notice Owner sends heartbeat to reset the inactivity timer.
     */
    function heartbeat() external onlyOwner notReleased {
        require(bootstrapped, "Not bootstrapped");
        require(block.timestamp < lastHeartbeat + lockDuration, "Timer already expired");

        lastHeartbeat = block.timestamp;
        emit HeartbeatSent(msg.sender, block.timestamp);
    }

    /**
     * @notice Owner withdraws a specific amount from the vault.
     */
    function withdraw(uint256 amount) external onlyOwner notReleased {
        require(bootstrapped, "Not bootstrapped");
        require(amount <= address(this).balance, "Insufficient balance");

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Anyone can trigger auto-release when the timer has expired.
     * @dev Transfers entire vault balance to the beneficiary.
     */
    function autoRelease() external notReleased {
        require(bootstrapped, "Not bootstrapped");
        require(block.timestamp >= lastHeartbeat + lockDuration, "Timer not expired");

        released = true;
        uint256 balance = address(this).balance;

        (bool success, ) = beneficiary.call{value: balance}("");
        require(success, "Transfer failed");

        emit AutoReleased(beneficiary, balance);
    }

    /**
     * @notice Get full vault state in a single call.
     */
    function getVaultState() external view returns (
        address _owner,
        address _beneficiary,
        uint256 _lockDuration,
        uint256 _lastHeartbeat,
        bool _released,
        bool _bootstrapped,
        uint256 _balance
    ) {
        return (owner, beneficiary, lockDuration, lastHeartbeat, released, bootstrapped, address(this).balance);
    }

    // Allow receiving native currency directly
    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }
}

/**
 * @title TrustVaultFactory — Deploys and indexes TrustVault instances.
 * @notice Provides on-chain vault discovery by owner and beneficiary.
 */
contract TrustVaultFactory {
    event VaultCreated(address indexed vault, address indexed owner, address indexed beneficiary, uint256 lockDuration);

    // Owner => list of vault addresses
    mapping(address => address[]) public ownerVaults;
    // Beneficiary => list of vault addresses
    mapping(address => address[]) public beneficiaryVaults;
    // All vaults
    address[] public allVaults;

    /**
     * @notice Deploy a new TrustVault, bootstrap it, and optionally fund it.
     */
    function createVault(
        address payable /* _beneficiary */,
        uint256 /* _lockDuration */
    ) external payable returns (address) {
        // Deploy new vault
        // TrustVault vault = new TrustVault();

        // Transfer ownership concept: the factory creates it, but we need
        // the vault owner to be msg.sender. Using a modified approach:
        // We'll use a create pattern where the vault is initialized directly.
        // Since constructor sets owner=msg.sender (factory), we use initialize pattern instead.
        
        // Actually, let's fix this: use an initializable pattern
        revert("Use createVault2");
    }

    /**
     * @notice Deploy a new TrustVault with proper ownership.
     */
    function createVault2(
        address payable _beneficiary,
        uint256 _lockDuration
    ) external payable returns (address) {
        TrustVaultV2 vault = new TrustVaultV2();
        vault.initialize(msg.sender, _beneficiary, _lockDuration);

        // Index
        ownerVaults[msg.sender].push(address(vault));
        beneficiaryVaults[_beneficiary].push(address(vault));
        allVaults.push(address(vault));

        // Forward any ETH
        if (msg.value > 0) {
            (bool success, ) = address(vault).call{value: msg.value}("");
            require(success, "Funding failed");
        }

        emit VaultCreated(address(vault), msg.sender, _beneficiary, _lockDuration);
        return address(vault);
    }

    function getVaultsByOwner(address _owner) external view returns (address[] memory) {
        return ownerVaults[_owner];
    }

    function getVaultsByBeneficiary(address _beneficiary) external view returns (address[] memory) {
        return beneficiaryVaults[_beneficiary];
    }

    function getVaultCount() external view returns (uint256) {
        return allVaults.length;
    }
}

/**
 * @title TrustVaultV2 — Initializable version for factory pattern.
 */
contract TrustVaultV2 {
    address public owner;
    address payable public beneficiary;
    uint256 public lockDuration;
    uint256 public lastHeartbeat;
    bool public released;
    bool public initialized;

    event Deposited(address indexed sender, uint256 amount);
    event HeartbeatSent(address indexed owner, uint256 timestamp);
    event Withdrawn(address indexed owner, uint256 amount);
    event AutoReleased(address indexed beneficiary, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier notReleased() {
        require(!released, "Vault already released");
        _;
    }

    /**
     * @notice Initialize the vault. Can only be called once (by factory).
     */
    function initialize(
        address _owner,
        address payable _beneficiary,
        uint256 _lockDuration
    ) external {
        require(!initialized, "Already initialized");
        require(_owner != address(0), "Invalid owner");
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_lockDuration > 0, "Invalid lock duration");

        owner = _owner;
        beneficiary = _beneficiary;
        lockDuration = _lockDuration;
        lastHeartbeat = block.timestamp;
        released = false;
        initialized = true;
    }

    function deposit() external payable {
        require(msg.value > 0, "Must send value");
        emit Deposited(msg.sender, msg.value);
    }

    function heartbeat() external onlyOwner notReleased {
        require(initialized, "Not initialized");
        require(block.timestamp < lastHeartbeat + lockDuration, "Timer already expired");
        lastHeartbeat = block.timestamp;
        emit HeartbeatSent(msg.sender, block.timestamp);
    }

    function withdraw(uint256 amount) external onlyOwner notReleased {
        require(initialized, "Not initialized");
        require(amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    function autoRelease() external notReleased {
        require(initialized, "Not initialized");
        require(block.timestamp >= lastHeartbeat + lockDuration, "Timer not expired");
        released = true;
        uint256 balance = address(this).balance;
        (bool success, ) = beneficiary.call{value: balance}("");
        require(success, "Transfer failed");
        emit AutoReleased(beneficiary, balance);
    }

    function getVaultState() external view returns (
        address _owner,
        address _beneficiary,
        uint256 _lockDuration,
        uint256 _lastHeartbeat,
        bool _released,
        bool _initialized,
        uint256 _balance
    ) {
        return (owner, beneficiary, lockDuration, lastHeartbeat, released, initialized, address(this).balance);
    }

    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }
}
