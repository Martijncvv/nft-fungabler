// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

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

contract NftFungabler {
    event NftLockup(
        address nftAddress,
        uint256 nftTokenId,
        address erc20Address,
        uint256 tokenIndex,
        uint256 timestamp
    );

    TokenContract[] public tokenContractArray;
    mapping(address => mapping(address => uint256)) ownerToNft;
    mapping(address => mapping(uint256 => address)) nftToErc20;

    // Lock NFT, mint ERC20s to owner.
    function lockNFT(
        string memory _erc20Name,
        string memory _erc20Ticker,
        uint256 _erc20Amount,
        address _nftContractAddress,
        uint256 _nftTokenId
    ) external returns (TokenContract) {
        // Transfer NFT to Contract
        IERC721 nftContract = IERC721(_nftContractAddress);
        nftContract.transferFrom(msg.sender, address(this), _nftTokenId);
        ownerToNft[msg.sender][address(nftContract)] = _nftTokenId;

        // Create ERC20 tokenContract and transfer to msg.sender;
        TokenContract erc20Contract = new TokenContract(
            _erc20Name,
            _erc20Ticker,
            _erc20Amount,
            msg.sender
        );

        uint256 erc20ArrayIndex = tokenContractArray.length;
        tokenContractArray.push(erc20Contract);

        address erc20ContractAddress = address(erc20Contract);
        nftToErc20[_nftContractAddress][_nftTokenId] = erc20ContractAddress;

        emit NftLockup(
            _nftContractAddress,
            _nftTokenId,
            erc20ContractAddress,
            erc20ArrayIndex,
            block.timestamp
        );

        return erc20Contract;
        // console.log(
        //     "%s %s (%s) tokens created as shares for NFT nr %s",
        //     _erc20Amount,
        //     _erc20Name,
        //     _erc20Ticker,
        //     _nftTokenId
        // );
    }

    // Unlock NFT
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
            address(0),
            erc20Contract.totalSupply()
        );
    }

    function getErc20ofNft(address _nftAddress, uint256 tokenId)
        external
        view
        returns (address)
    {
        return nftToErc20[_nftAddress][tokenId];
    }
}
