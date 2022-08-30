import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'

import NavbarTop from './components/NavbarTop'
import ConnectWalletHeroe from './components/ConnectWalletHeroe'
import NftFungabler from './components/NftFungabler'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'

import NFT_FUNGABLER_JSON from './utils/NftFungabler.json'
import ERC20_CONTRACT_JSON from './utils/ERC20Contract.json'
import ERC721_CONTRACT_JSON from './utils/ERC721Contract.json'

const NFT_FUNGABLER_ABI = NFT_FUNGABLER_JSON.abi
const NFT_FUNGABLER_CONTRACT_ADDRESS: string =
	'0xF99108b11C4C6D7aEb10FC510753b0Be5Fa298DA'

const ERC721_CONTRACT_ABI = ERC721_CONTRACT_JSON.abi
const ERC20_CONTRACT_ABI = ERC20_CONTRACT_JSON.abi

function App() {
	const [currentAccount, setCurrentAccount] = useState<string>('')
	const [signer, setSigner] = useState<any>('')
	const [nftFungablerContract, setNftFungablerContract] = useState<any>('')
	const [infoBar, setInfoBar] = useState<string>('')

	useEffect(() => {
		checkIfWalletIsConnected()
		console.log('currentAccount')
		console.log(currentAccount)
	}, [currentAccount])

	const checkIfWalletIsConnected = async () => {
		console.log('checkIfWalletIsConnected()')
		try {
			const { ethereum }: any = window
			if (!ethereum) {
				console.log('Make sure you have metamask!')
				return
			}

			let etherProvider = new ethers.providers.Web3Provider(ethereum)
			let etherSigner = await etherProvider.getSigner()
			setSigner(etherSigner)
			const { chainId } = await etherProvider.getNetwork()

			if (chainId !== 4) {
				alert('Connect to Rinkeby test network')
			}

			const accounts = await ethereum.request({ method: 'eth_accounts' })

			if (accounts.length !== 0) {
				const account = accounts[0]
				setCurrentAccount(account)

				const nftFungablerContract = await new ethers.Contract(
					NFT_FUNGABLER_CONTRACT_ADDRESS,
					NFT_FUNGABLER_ABI,
					etherSigner
				)
				setNftFungablerContract(nftFungablerContract)
			} else {
				console.log('No authorized account found')
			}
		} catch (error) {
			console.log(error)
		}
	}

	const connectWallet = async () => {
		console.log('connectWallet()')
		console.log('signer')
		console.log(signer)
		try {
			const { ethereum }: any = window
			if (!ethereum) {
				alert('Get MetaMask!')
				return
			}

			const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

			setCurrentAccount(accounts[0])
		} catch (error) {
			console.log(error)
		}
	}

	return (
		<div className="App">
			<Container>
				<Row>
					<Col xs={11}>
						<NavbarTop />
						{currentAccount.length === 0 && (
							<ConnectWalletHeroe connectWallet={connectWallet} />
						)}
						{infoBar.length > 0 && <Alert variant="primary">{infoBar}</Alert>}
						<NftFungabler
							currentAccount={currentAccount}
							nftFungablerContract={nftFungablerContract}
							setInfoBar={setInfoBar}
							NFT_FUNGABLER_CONTRACT_ADDRESS={NFT_FUNGABLER_CONTRACT_ADDRESS}
							ERC721_CONTRACT_ABI={ERC721_CONTRACT_ABI}
							ERC20_CONTRACT_ABI={ERC20_CONTRACT_ABI}
							signer={signer}
						/>
					</Col>
				</Row>
			</Container>
		</div>
	)
}

export default App
