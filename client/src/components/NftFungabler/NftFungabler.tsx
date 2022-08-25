import * as React from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { useState } from 'react'

interface INftFungablerProps {}

const NftFungabler: React.FunctionComponent<INftFungablerProps> = (props) => {
	const [amount, setAmount] = useState<number>()

	const handleButtonClick = async () => {}

	return (
		<Container>
			<Row>
				<Col>
					<h2>Fungable NFT</h2>
					<Form>
						<h4>NFT Info</h4>
						<Form.Group as={Row} className="mb-3">
							<Form.Label column sm="5">
								Contract address
							</Form.Label>
							<Col>
								<Form.Control type="text" placeholder="0xFA3..." />
							</Col>
						</Form.Group>

						<Form.Group as={Row} className="mb-3">
							<Form.Label column sm="5">
								Token Id
							</Form.Label>
							<Col>
								<Form.Control type="text" placeholder="Token Id" />
							</Col>
						</Form.Group>

						<h4>ERC20 to be minted </h4>
						<Form.Group as={Row} className="mb-3">
							<Form.Label column sm="5">
								Name
							</Form.Label>
							<Col>
								<Form.Control type="text" placeholder="Ethereum" />
							</Col>
						</Form.Group>

						<Form.Group as={Row} className="mb-3">
							<Form.Label column sm="5">
								Ticker
							</Form.Label>
							<Col>
								<Form.Control type="text" placeholder="ETH" />
							</Col>
						</Form.Group>
						<Form.Group as={Row} className="mb-3">
							<Form.Label column sm="5">
								Amount
							</Form.Label>
							<Col>
								<Form.Control type="number" placeholder="21.000.000" />
							</Col>
						</Form.Group>
						<Button variant="primary" type="submit">
							Lock & Mint
						</Button>
					</Form>
				</Col>
				<Col></Col>
				<Col></Col>
			</Row>
		</Container>
	)
}

export default NftFungabler
