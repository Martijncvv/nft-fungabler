require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()
require('@nomiclabs/hardhat-etherscan')

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: '0.8.4',

	networks: {
		localhost: {
			url: 'http://localhost:8545',
		},

		rinkeby: {
			url: process.env.ALCHEMY_API_URL,
			accounts: [process.env.RINKEBY_PRIVATE_KEY],
		},
	},
	etherscan: {
		// Your API key for Etherscan
		// Obtain one at https://etherscan.io/
		apiKey: process.env.ETHERSCAN_API_KEY,
	},
}
