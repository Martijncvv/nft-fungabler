const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs')
const { expect } = require('chai')

describe('NftFungabler', async function () {
	let erc20Name = 'Name1'
	let erc20Ticker = 'N1'
	let erc20Amount = 123
	let nftTokenId = 0

	let account_1, account_2, account_3
	let nftFungablerContract
	let nftFungablerContractAddress
	let nftContract
	let nftContractAddress
	let erc20Contract
	let erc20ContractAddress

	it('Should deploy NFT contract and mint', async function () {
		;[account_1, account_2, account_3] = await ethers.getSigners()
		let NftContract = await hre.ethers.getContractFactory('Artwork')
		nftContract = await NftContract.deploy('Test1', 'T1')

		await nftContract.deployed()
		nftContractAddress = nftContract.address

		const tokenURI =
			'https://opensea-creatures-api.herokuapp.com/api/creature/1'
		const tx = await nftContract.connect(account_2).mint(tokenURI)

		expect(await nftContract.balanceOf(account_2.address)).to.equal(1)
	})

	it('Should deploy NFTFungabler', async function () {
		// Contracts are deployed using the first signer/account by default

		const NftFungablerContract = await hre.ethers.getContractFactory(
			'NftFungabler'
		)
		nftFungablerContract = await NftFungablerContract.deploy()

		await nftFungablerContract.deployed()

		// console.log(`NFT Fungabler deployed to ${nftFungablerContract.address}`)
		expect(nftFungablerContract.address).to.not.equal(0)
	})

	// describe('Testing Contracts', function () {

	it('Should give approval to contract to transfer NFT', async function () {
		nftFungablerContractAddress = nftFungablerContract.address

		await nftContract
			.connect(account_2)
			.approve(nftFungablerContractAddress, nftTokenId)

		expect(
			await nftContract.connect(account_2).getApproved(nftTokenId)
		).to.equal(nftFungablerContractAddress)
	})
	// })
	it('Should Lock NFT and mint ERC20 tokens to previous NFT account_1', async function () {
		await nftFungablerContract
			.connect(account_2)
			.lockNFT(
				erc20Name,
				erc20Ticker,
				ethers.BigNumber.from((erc20Amount * 10 ** 18).toString()),
				nftContractAddress,
				nftTokenId
			)
		erc20ContractAddress = await nftFungablerContract.getErc20ofNft(
			nftContractAddress,
			nftTokenId
		)
		const Erc20Contract = await hre.ethers.getContractFactory('TokenContract')
		erc20Contract = Erc20Contract.attach(erc20ContractAddress)

		const erc20Balance = await erc20Contract.balanceOf(account_2.address)
		expect(await erc20Balance).to.equal(
			ethers.BigNumber.from((erc20Amount * 10 ** 18).toString())
		)
	})

	it('Contract should be owner of NFT', async function () {
		const nftOwnerAddress = await nftContract.ownerOf(nftTokenId)
		expect(nftFungablerContractAddress).to.equal(nftOwnerAddress)
	})

	it('Should revert if account without enough tokens tries to unlock NFT', async function () {
		await expect(
			nftFungablerContract
				.connect(account_3)
				.unlockNft(nftContractAddress, nftTokenId)
		).to.be.revertedWith("unlockNft(), Caller doesn't hold all tokens")
	})

	it('Should revert if previous NFT owner WITHOUT enough tokens tries to unlock NFT', async function () {
		await erc20Contract.connect(account_2).transfer(account_1.address, 1234)

		const balanceOfaccount_1 = await erc20Contract.balanceOf(account_1.address)
		const balanceOfaccount_2 = await erc20Contract.balanceOf(account_2.address)
		const balanceOfaccount_3 = await erc20Contract.balanceOf(account_3.address)

		console.log(`Balance of "account_1": ${balanceOfaccount_1}`)
		console.log(`Balance of "account_2": ${balanceOfaccount_2}`)
		console.log(`Balance of "account_2": ${balanceOfaccount_3}`)

		await expect(
			nftFungablerContract
				.connect(account_2)
				.unlockNft(nftContractAddress, nftTokenId)
		).to.be.revertedWith("unlockNft(), Caller doesn't hold all tokens")
	})

	it('Should unlock NFT if new account tries to unlock with all tokens', async function () {
		await erc20Contract.connect(account_1).transfer(account_3.address, 1234)
		await erc20Contract
			.connect(account_2)
			.transfer(
				account_3.address,
				await erc20Contract.balanceOf(account_2.address)
			)

		const balanceOfaccount_3 = await erc20Contract.balanceOf(account_3.address)

		console.log(`Balance of "account_3": ${balanceOfaccount_3}`)

		await erc20Contract
			.connect(account_3)
			.approve(nftFungablerContractAddress, balanceOfaccount_3)

		await expect(
			nftFungablerContract
				.connect(account_3)
				.unlockNft(nftContractAddress, nftTokenId)
		).not.to.be.reverted
	})

	it('Should make Account 3 the new NFT owner', async function () {
		const nftOwnerAddress = await nftContract.ownerOf(nftTokenId)
		expect(account_3.address).to.equal(nftOwnerAddress)
	})
	it('Should erase ERC20 balance of Account 3', async function () {
		const balanceOfaccount_3 = await erc20Contract.balanceOf(account_3.address)
		console.log(`Balance of Account 3: ${balanceOfaccount_3}`)
		expect(balanceOfaccount_3).to.equal(0)
	})
})
