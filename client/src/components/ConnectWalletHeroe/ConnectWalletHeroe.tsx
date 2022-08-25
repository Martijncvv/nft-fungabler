import { useState } from 'react'

import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Modal from 'react-bootstrap/Modal'

interface IConnectWalletHeroeProps {
	connectWallet: () => void
}

const ConnectWalletHeroe: React.FunctionComponent<IConnectWalletHeroeProps> = ({
	connectWallet,
}) => {
	const [isLoading, setIsLoading] = useState(false)

	const handleButtonClick = async () => {
		setIsLoading(true)
		await connectWallet()
		setIsLoading(false)
	}

	return (
		<Container>
			<Row>
				<Col></Col>
				<Col>
					{' '}
					<Button
						variant="primary"
						disabled={isLoading}
						onClick={() => (!isLoading ? handleButtonClick() : null)}
					>
						{isLoading ? (
							<div>
								<Spinner animation="border" variant="light" size="sm" />{' '}
								<span>Connecting...</span>
							</div>
						) : (
							'Connect Wallet'
						)}
					</Button>
				</Col>
				<Col></Col>
			</Row>
		</Container>
		// <Modal.Dialog>
		// 	<Modal.Header closeButton>
		// 		<Modal.Title>Connect Wallet</Modal.Title>
		// 	</Modal.Header>

		// 	<Modal.Body>
		// 		<p>Modal body text goes here.</p>
		// 	</Modal.Body>

		// 	<Modal.Footer>
		// 		<Button
		// 			variant="primary"
		// 			disabled={isLoading}
		// 			onClick={() => (!isLoading ? handleButtonClick() : null)}
		// 		>
		// 			{isLoading ? (
		// 				<div>
		// 					<Spinner animation="border" variant="light" size="sm" />{' '}
		// 					<span>Connecting...</span>
		// 				</div>
		// 			) : (
		// 				'Connect'
		// 			)}
		// 		</Button>
		// 	</Modal.Footer>
		// </Modal.Dialog>
	)
}

export default ConnectWalletHeroe
