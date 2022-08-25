import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'

import NavbarTop from './components/NavbarTop'
import ConnectWalletHeroe from './components/ConnectWalletHeroe'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import NftFungabler from './components/NftFungabler'

function App() {
	const [currentAccount, setCurrentAccount] = useState('')

	useEffect(() => {
		checkIfWalletIsConnected()
	}, [currentAccount])

	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum }: any = window
			if (!ethereum) {
				console.log('Make sure you have metamask!')
				return
			}

			let etherProvider = new ethers.providers.Web3Provider(ethereum)
			let etherSigner = etherProvider.getSigner()

			const { chainId } = await etherProvider.getNetwork()

			if (chainId !== 4) {
				alert('Connect to Rinkeby test network')
			}

			const accounts = await ethereum.request({ method: 'eth_accounts' })

			if (accounts.length !== 0) {
				const account = accounts[0]
				setCurrentAccount(account)
			} else {
				console.log('No authorized account found')
			}
		} catch (error) {
			console.log(error)
		}
	}

	const connectWallet = async () => {
		try {
			console.log('connectWallet()')
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
						{currentAccount.length !== 0 && (
							<ConnectWalletHeroe connectWallet={connectWallet} />
						)}
						<NftFungabler />
					</Col>
				</Row>
			</Container>
		</div>
	)
}

export default App
