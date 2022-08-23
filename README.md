# NFT Fungabler

## Idea

Since it's hard to get a little bit of value for your jpegs these days. Why not lock it up in a smartcontract and sell shares of it.

A contract that locks an ERC721 token and creates a specified amount of ERC20 tokens. In order to unlock the NFT from the smartcontract, the accounts needs to hold ALL ERC20 tokens.

[Verified Etherscan Rinkeby Contractaddress](https://rinkeby.etherscan.io/address/0x95283dAf66f35cf795785aFe515685c0b5A434E6#code)

## Directory Structure

| Folder    | Content                           |
| --------- | --------------------------------- |
| Contracts | Solidity smartcontracts           |
| Scripts   | Scripts to deploy smartcontracts  |
| Test      | Smartcontract tests in Javascript |

## Run smartcontract tests

- In terminal, `git clone https://github.com/Martijncvv/nft-fungabler.git`
- In terminal at project root folder, `npm install`
- In terminal at project root folder, `npx hardhat test test/NftFungabler.js `

## Personal Rinkeby Test NFT Data

nftContract: 0xf5de760f2e916647fd766B4AD9E85ff943cE3A2b
nftID: 1434203
