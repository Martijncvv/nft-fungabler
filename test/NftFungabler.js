const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs')
const { expect } = require('chai')

describe('NftFungabler', async function () {
	let owner, otherAccount
	let nftFungablerContract
	let ArtworkContract

	it('Should deploy NFT contract and mint', async function () {
		let [owner, otherAccount] = await ethers.getSigners()
		ArtworkContract = await hre.ethers.getContractFactory('Artwork')
		const artworkContract = await ArtworkContract.deploy('Test1', 'T1')

		await artworkContract.deployed()

		const tokenURI =
			'https://opensea-creatures-api.herokuapp.com/api/creature/1'
		const tx = await artworkContract.connect(otherAccount).mint(tokenURI)

		expect(await artworkContract.balanceOf(otherAccount.address)).to.equal(1)
	})

	it('Should deploy NFTFungabler', async function () {
		// Contracts are deployed using the first signer/account by default

		const NftFungablerContract = await hre.ethers.getContractFactory(
			'NftFungabler'
		)
		nftFungablerContract = await NftFungablerContract.deploy()

		await nftFungablerContract.deployed()

		console.log(`NFT Fungabler deployed to ${nftFungablerContract.address}`)
		expect(nftFungablerContract.address).to.not.equal(0)
	})

	// describe('Testing Contracts', function () {
	let _erc20Name = 'Name1'
	let _erc20Ticker = 'N1'
	let _erc20Amount = 123 * 10 ** 18
	let _nftFungablerContractAddress = nftFungablerContract.address
	let _nftTokenId = 0

	it('Should give approval to contract to transfer NFT', async function () {
		const approval = await ArtworkContract.connect(otherAccount).approve(
			_nftFungablerContractAddress,
			_nftTokenId
		)
		expect(await ArtworkContract.getApproved(_nftTokenId)).to.equal(
			_nftFungablerContractAddress
		)
	})
	// })
	// 	it('Should Lock NFT and mint ERC20 tokens', async function () {
	// 		const erc20Contract = await nftFungablerContract
	// 			.connect(otherAccount_1)
	// 			.lockNFT(
	// 				_erc20Name,
	// 				_erc20Ticker,
	// 				_erc20Amount,
	// 				_nftContractAddress,
	// 				_nftTokenId
	// 			)

	// 		const erc20Balance = await erc20Contract.balanceOf(otherAccount_1)
	// 		expect(await erc20Balance).to.equal(_erc20Amount)
	// 	})
	// })
})
