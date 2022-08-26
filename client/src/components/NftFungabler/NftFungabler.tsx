import * as React from 'react'
import { ethers } from 'ethers'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import { useEffect, useState } from 'react'

interface INftFungablerProps {
	currentAccount: string
	nftFungablerContract: any
	setInfoBar: any
	NFT_FUNGABLER_CONTRACT_ADDRESS: string
	ERC721_CONTRACT_ABI: any
	ERC20_CONTRACT_ABI: any
	signer: any
}

const NftFungabler: React.FunctionComponent<INftFungablerProps> = ({
	currentAccount,
	nftFungablerContract,
	setInfoBar,
	NFT_FUNGABLER_CONTRACT_ADDRESS,
	ERC721_CONTRACT_ABI,
	ERC20_CONTRACT_ABI,
	signer,
}) => {
	const [erc721Address, setErc721Address] = useState<string>(
		'0xf5de760f2e916647fd766B4AD9E85ff943cE3A2b'
	)
	const [tokenId, setTokenId] = useState<string>('1641511')
	const [erc20Name, setErc20Name] = useState<string>('ReactTest_1')
	const [erc20Ticker, setErc20Ticker] = useState<string>('RT1')
	const [erc20Amount, setErc20Amount] = useState<string>('12131')
	const [erc20Address, setErc20Address] = useState<string>('')

	const [erc20Balance, setErc20Balance] = useState<any>()

	// useEffect(() => {
	// 	getBalanceOfAccount()
	// }, [currentAccount, erc721Address, erc20Address])

	const lockErc721 = async () => {
		try {
			const erc721Contract = await new ethers.Contract(
				erc721Address,
				ERC721_CONTRACT_ABI,
				signer
			)

			let approvalTx = await erc721Contract.approve(
				NFT_FUNGABLER_CONTRACT_ADDRESS,
				tokenId
			)
			setInfoBar(`Mining... Approval Tx ${approvalTx.hash}`)
			console.log('Mining...Approval Tx', approvalTx.hash)

			await approvalTx.wait()
			setInfoBar(`Mined -- Approval Tx${approvalTx.hash}`)
			console.log('Mined -- Approval Tx', approvalTx.hash)

			let lockTx = await nftFungablerContract.lockNft(
				erc721Address,
				tokenId,
				erc20Name,
				erc20Ticker,
				ethers.utils.parseUnits(erc20Amount, 18)
			)

			setInfoBar(`Mining... Tx ${lockTx.hash}`)
			console.log('Mining...Tx', lockTx.hash)

			await lockTx.wait()
			setInfoBar(`Mined -- Tx${lockTx.hash}`)
			console.log('Mined -- Tx', lockTx.hash)
		} catch (error) {
			console.log(error)
		}
	}

	const unlockErc721 = async () => {
		try {
			await getErc20AddressOfErc721()

			const erc20Contract = await new ethers.Contract(
				erc20Address,
				ERC20_CONTRACT_ABI,
				signer
			)

			let erc20Balance = await getBalanceOfAccount()
			let totalSupply = await erc20Contract.totalSupply()
			console.log(erc20Balance)
			console.log(totalSupply)

			if (erc20Balance._hex === totalSupply._hex) {
				let approvalTx = await erc20Contract.approve(
					NFT_FUNGABLER_CONTRACT_ADDRESS,
					erc20Balance
				)
				setInfoBar(`Mining... Approval Tx ${approvalTx.hash}`)
				console.log('Mining...Approval Tx', approvalTx.hash)

				await approvalTx.wait()
				setInfoBar(`Mined -- Approval Tx${approvalTx.hash}`)
				console.log('Mined -- Approval Tx', approvalTx.hash)

				let unlockTx = nftFungablerContract.unlockNft(erc721Address, tokenId)

				setInfoBar(`Mining... Unlock Tx ${unlockTx.hash}`)
				console.log('Mining... Unlock Tx', unlockTx.hash)

				await unlockTx.wait()
				setInfoBar(`Mined -- Unlock Tx${unlockTx.hash}`)
				console.log('Mined -- Unlock Tx', unlockTx.hash)
			} else {
				setInfoBar(`Client error, token balance not enough.`)
				console.log(`Client error, token balance not enough.`)
			}
		} catch (error) {
			console.log(error)
		}
	}

	const getErc20AddressOfErc721 = async () => {
		let erc20AddressOfNft = await nftFungablerContract.getErc20OfErc721(
			erc721Address,
			tokenId
		)
		setErc20Address(erc20AddressOfNft)
		return erc20AddressOfNft
	}

	const getBalanceOfAccount = async () => {
		let erc20Address = await getErc20AddressOfErc721()
		if (erc20Address !== '0x0000000000000000000000000000000000000000') {
			const erc20Contract = await new ethers.Contract(
				erc20Address,
				ERC20_CONTRACT_ABI,
				signer
			)

			let erc20Balance = await erc20Contract.balanceOf(currentAccount)

			setErc20Balance(ethers.utils.formatUnits(erc20Balance, 18))
			return erc20Balance
		} else {
			setInfoBar(
				`No ERC20 tokens found for contract ${erc721Address} + tokenId ${tokenId}.`
			)
			console.log(
				`No ERC20 tokens found for contract ${erc721Address} + tokenId ${tokenId}.`
			)
		}
	}

	const handleButtonClickLock = async () => {
		lockErc721()
	}
	const handleButtonClickUnlock = async () => {
		unlockErc721()
	}

	const handleButtonClickAccount = async () => {
		console.log('erc721Address')
		console.log(erc721Address)
		getBalanceOfAccount()
	}

	const handleErc721AddressChange = async (erc721Address: string) => {
		setErc721Address(erc721Address)
		getErc20AddressOfErc721()
	}

	return (
		<Container>
			<Row>
				<Col>
					<h4>Lock NFT</h4>

					<div>
						<span className="input-group-text">NFT Contract Address</span>
						<input
							type="text"
							placeholder="0xFA3..."
							onChange={(event) => setErc721Address(event.target.value)}
						/>
					</div>

					<div>
						<span className="input-group-text">Token Id</span>
						<input
							type="text"
							placeholder="Token id"
							onChange={(event) => setTokenId(event.target.value)}
						/>
					</div>

					<h4>ERC20 to be Minted </h4>
					<div>
						<span className="input-group-text">Name</span>
						<input
							type="text"
							placeholder="Ethereum"
							onChange={(event) => setErc20Name(event.target.value)}
						/>
					</div>
					<div>
						<span className="input-group-text">Ticker</span>
						<input
							type="text"
							placeholder="ETH"
							onChange={(event) => setErc20Ticker(event.target.value)}
						/>
					</div>
					<div>
						<span className="input-group-text">Amount</span>
						<input
							type="text"
							placeholder="21.000.000"
							onChange={(event) => setErc20Amount(event.target.value)}
						/>
					</div>

					<Button variant="primary" onClick={handleButtonClickLock}>
						Lock & Mint
					</Button>
				</Col>
				<Col>
					<h4>Unlock NFT</h4>

					<div>
						<span className="input-group-text">NFT Contract Address</span>
						<input
							type="text"
							placeholder="0xFA3..."
							onChange={(event) => setErc721Address(event.target.value)}
						/>
					</div>

					<div>
						<span className="input-group-text">Token Id</span>
						<input
							type="text"
							placeholder="Token id"
							onChange={(event) => setTokenId(event.target.value)}
						/>
					</div>

					<Button variant="primary" onClick={handleButtonClickUnlock}>
						Unlock
					</Button>
				</Col>
				<Col>
					<h4>Account Info</h4>
					<h5>Erc20 token</h5>
					<p>{erc20Address}</p>
					<h5>Amount</h5>
					<p>{erc20Balance}</p>
					<Button variant="primary" onClick={handleButtonClickAccount}>
						Get Info
					</Button>
				</Col>
			</Row>
		</Container>
	)
}

export default NftFungabler
