// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// @title TokenContract
// @author marty_cfly
// @notice ERC20 contract that gets deployed when NFT gets locked
contract TokenContract is ERC20 {
    constructor(
        string memory _tokenName,
        string memory _ticker,
        uint256 _amount,
        address _creator
    ) ERC20(_tokenName, _ticker) {
        _mint(_creator, _amount);
    }
}

// @title NFT-Fungabler
// @author marty_cfly
// @notice Locks an NFT and mints a specified amount of ERC20 tokens.
// @notice Account needs to hold all ERC20 tokens to unlock NFT.
contract NftFungabler {
    /// @notice Emitted when NFT is locked
    /// @param nftAddress Contract of NFT
    /// @param nftTokenId NFT tokenId
    /// @param erc20Address Created ERC20 token
    /// @param caller Account that locked NFT
    /// @param timestamp Timestamp
    event NftLockup(
        address nftAddress,
        uint256 nftTokenId,
        address erc20Address,
        address caller,
        uint256 timestamp
    );

    /// @notice Emitted when NFT is unlocked
    /// @param nftAddress Contract of NFT
    /// @param nftTokenId NFT tokenId
    /// @param erc20Address Burned ERC20 token
    /// @param caller Account that unlocked NFT
    /// @param timestamp Timestamp
    event NftUnlock(
        address nftAddress,
        uint256 nftTokenId,
        address erc20Address,
        address caller,
        uint256 timestamp
    );

    /// @notice Emitted when Ether is sent to the contract
    /// @param func Function that was called
    /// @param sender Sender of the Ether
    /// @param value Amount of Ethere received
    /// @param data Data of the tx
    event Log(string func, address sender, uint value, bytes data);

    TokenContract[] public tokenContractArray;
    mapping(address => mapping(address => uint256)) ownerToNft;
    mapping(address => mapping(uint256 => address)) nftToErc20;

    /// @notice Receives Ether if tx data was added
    fallback() external payable {
        (bool success, ) = msg.sender.call{value: msg.value}("");
        require(success, "fallback(), tx failed");
        emit Log("fallback", msg.sender, msg.value, msg.data);
    }

    /// @notice Receives Ether if no tx data was added
    receive() external payable {
        (bool success, ) = msg.sender.call{value: msg.value}("");
        require(success, "receive(), tx failed");
        emit Log("receive", msg.sender, msg.value, "");
    }

    /// @notice Locks NFT and Mints ERC20 tokens to caller
    /// @dev NftFungabler contract needs approval to transfer NFT
    /// @param _erc20Name Minted ERC20 name
    /// @param _erc20Ticker Minted ERC20 ticker
    /// @param _erc20Amount Minted ERC20 amount
    /// @param _nftContractAddress Contract address of NFT to lock
    /// @param _nftTokenId TokenId of NFT to lock
    function lockNFT(
        string memory _erc20Name,
        string memory _erc20Ticker,
        uint256 _erc20Amount,
        address _nftContractAddress,
        uint256 _nftTokenId
    ) external {
        // Transfers NFT to Contract
        IERC721 nftContract = IERC721(_nftContractAddress);
        nftContract.transferFrom(msg.sender, address(this), _nftTokenId);
        ownerToNft[msg.sender][address(nftContract)] = _nftTokenId;

        // Mints ERC20 tokens to caller
        TokenContract erc20Contract = new TokenContract(
            _erc20Name,
            _erc20Ticker,
            _erc20Amount,
            msg.sender
        );

        tokenContractArray.push(erc20Contract);

        address erc20ContractAddress = address(erc20Contract);
        nftToErc20[_nftContractAddress][_nftTokenId] = erc20ContractAddress;

        emit NftLockup(
            _nftContractAddress,
            _nftTokenId,
            erc20ContractAddress,
            msg.sender,
            block.timestamp
        );
    }

    /// @notice Unlocks NFT and Burns ERC20 tokens of caller
    /// @dev NftFungabler contract needs approval to transfer ERC20 tokens
    /// @param _nftContractAddress Contract address of NFT to unlock
    /// @param _nftTokenId TokenId of NFT to lock

    function unlockNft(address _nftContractAddress, uint256 _nftTokenId)
        external
    {
        IERC721 nftContract = IERC721(_nftContractAddress);
        address erc20Address = nftToErc20[_nftContractAddress][_nftTokenId];

        IERC20 erc20Contract = IERC20(erc20Address);
        require(
            erc20Contract.totalSupply() == erc20Contract.balanceOf(msg.sender),
            "unlockNft(), Caller doesn't hold all tokens"
        );

        nftContract.transferFrom(address(this), msg.sender, _nftTokenId);
        erc20Contract.transferFrom(
            msg.sender,
            address(0xdead),
            erc20Contract.totalSupply()
        );

        emit NftUnlock(
            _nftContractAddress,
            _nftTokenId,
            erc20Address,
            msg.sender,
            block.timestamp
        );
    }

    /// @notice Gets ERC20 tokenaddress of NFT
    /// @param _nftContractAddress Contract address of NFT to unlock
    /// @param _nftTokenId TokenId of NFT to lock
    /// @return erc20Address Returns address of ERC20 tokens of locked NFT
    function getErc20ofNft(address _nftContractAddress, uint256 _nftTokenId)
        external
        view
        returns (address erc20Address)
    {
        erc20Address = nftToErc20[_nftContractAddress][_nftTokenId];
    }
}
