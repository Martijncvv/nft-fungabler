// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// @title Constant Factor AMM Dex
// @author marty_cfly
// @notice Dex to create a swapping pool
contract TokenAmmDex {
    /// @notice Emitted when ETH gets swapped to Token
    /// @param caller msg.sender
    /// @param txDetails Type of Swap
    /// @param ethInput Amount of ETH swapped
    /// @param tokenOutput Amount of tokens outputted
    event EthToTokenSwap(
        address caller,
        string txDetails,
        uint256 ethInput,
        uint256 tokenOutput
    );

    /// @notice Emitted when Tokens get swapped to ETH
    /// @param caller msg.sender
    /// @param txDetails Type of Swap
    /// @param tokensInput Amount of tokens swapped
    /// @param ethOutput Amount of ETH outputted
    event TokenToEthSwap(
        address caller,
        string txDetails,
        uint256 tokensInput,
        uint256 ethOutput
    );

    /// @notice Emitted when liquidity it provided
    /// @param liquidityProvider msg.sender
    /// @param tokensInput Amount of tokens inputted
    /// @param ethInput Amount of ETH inputted
    /// @param liquidityMinted amount of liquidity minted
    event LiquidityProvided(
        address liquidityProvider,
        uint256 tokensInput,
        uint256 ethInput,
        uint256 liquidityMinted
    );

    /// @notice Emitted when liquidity it removed
    /// @param liquidityRemover msg.sender
    /// @param tokensOutput Amount of tokens outputted
    /// @param ethOutput Amount of ETH outputted
    /// @param liquidityWithdrawn amount of liquidity removed
    event LiquidityRemoved(
        address liquidityRemover,
        uint256 tokensOutput,
        uint256 ethOutput,
        uint256 liquidityWithdrawn
    );

    /// @notice Swap pool created for provided ERC20token contract
    constructor(address _erc20tokenAddress) {
        erc20Token = IERC20(_erc20tokenAddress);
    }

    IERC20 erc20Token;
    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    function init(uint256 _erc20Tokens) public payable returns (uint256) {
        totalLiquidity += address(this).balance;
        liquidity[msg.sender] = totalLiquidity;
        require(
            erc20Token.transferFrom(msg.sender, address(this), _erc20Tokens),
            "init() Transfer failed"
        );

        return totalLiquidity;
    }

    /// @notice Gets output amount of constant factor formula (x + xd * y + yd = k)
    /// @param _xInput Amount added to the liquidity pool
    /// @param _xReserves Amount of x in liquidity pool
    /// @param _yReserves Amount of y in liquidity pool
    /// @return Returns outputted amount of the pool
    function calculateOutputAmount(
        uint256 _xInput,
        uint256 _xReserves,
        uint256 _yReserves
    ) public pure returns (uint256) {
        // the fee the liquidity providers takes for each swap: 0.3% = 997
        uint256 fee = 997;

        uint256 xInputWithFee = _xInput * fee;
        uint256 xReserves = _xReserves * 1000;
        uint256 yReserves = _yReserves;

        uint256 numerator = xInputWithFee * yReserves;
        uint256 denominator = xReserves + xInputWithFee;

        uint256 yOutput = numerator / denominator;
        return yOutput;
    }

    /// @notice Swaps ETH to Erc20Tokens
    /// @return Returns outputted amount of tokens
    function ethToTokenSwap() public payable returns (uint256) {
        uint256 ethInput = msg.value;
        uint256 ethReserve = address(this).balance - msg.value;
        uint256 tokenReserve = erc20Token.balanceOf(address(this));

        uint256 tokenOutput = calculateOutputAmount(
            ethInput,
            ethReserve,
            tokenReserve
        );

        require(
            erc20Token.transfer(msg.sender, tokenOutput),
            "ethToToken() token transfer failed"
        );

        emit EthToTokenSwap(
            msg.sender,
            "Eth to Erc20Token",
            msg.value,
            tokenOutput
        );

        return tokenOutput;
    }

    /// @notice Swaps Erc20Tokens to ETH
    /// @param _tokenInput Amount of tokens being swapped to ETH
    /// @return Returns outputted amount of ETH
    function tokenToEthSwap(uint256 _tokenInput) public returns (uint256) {
        uint256 tokenInput = _tokenInput;
        uint256 tokenReserve = erc20Token.balanceOf(address(this));
        uint256 ethReserve = address(this).balance;

        uint256 ethOutput = calculateOutputAmount(
            tokenInput,
            tokenReserve,
            ethReserve
        );

        require(
            erc20Token.transferFrom(msg.sender, address(this), tokenInput),
            "tokenToEth() Token transfer failed"
        );
        (bool success, ) = msg.sender.call{value: ethOutput}("");
        require(success, "tokenToEth() Eth transfer failed");

        emit TokenToEthSwap(
            msg.sender,
            "Erc20token to ETH",
            ethOutput,
            tokenInput
        );
        return ethOutput;
    }

    /// @notice Deposits liquidity to the pool
    /// @return Returns deposited amount of Erc20Tokens
    function depositLiquidity() public payable returns (uint256) {
        uint256 ethInput = msg.value;
        uint256 ethReserve = address(this).balance - msg.value;
        uint256 tokenReserve = erc20Token.balanceOf(address(this));
        uint256 tokenEthRatio = tokenReserve / ethReserve;

        uint256 tokensToDeposit = ethInput * tokenEthRatio;

        uint256 ethLiquidityRatio = totalLiquidity / ethReserve;
        uint256 ethLiquidityShare = ethInput * ethLiquidityRatio;

        liquidity[msg.sender] += ethLiquidityShare;

        require(
            erc20Token.transferFrom(msg.sender, address(this), tokensToDeposit),
            "deposit() token transfer failed"
        );

        emit LiquidityProvided(
            msg.sender,
            ethLiquidityShare,
            msg.value,
            tokensToDeposit
        );
        return tokensToDeposit;
    }

    /// @notice Deposits liquidity to the pool
    /// @param _amount Amount of liquidity being withdrawn
    /// @return Returns withdrawn ETH and withdrawn Erc20Tokens
    function withdrawLiquidity(uint256 _amount)
        public
        returns (uint256, uint256)
    {
        require(liquidity[msg.sender] > _amount, "not enough balance");

        uint256 ethReserve = address(this).balance;
        uint256 tokenReserve = erc20Token.balanceOf(address(this));

        uint256 ethLiquidityRatio = ethReserve / totalLiquidity;
        uint256 ethToWithdraw = _amount * ethLiquidityRatio;

        uint256 tokenLiquidityRatio = tokenReserve / totalLiquidity;
        uint256 tokensToWithdraw = _amount * tokenLiquidityRatio;

        liquidity[msg.sender] = liquidity[msg.sender] - _amount;
        totalLiquidity = totalLiquidity - _amount;

        require(
            erc20Token.transfer(msg.sender, tokensToWithdraw),
            "withdraw() token transfer failed"
        );

        (bool success, ) = payable(msg.sender).call{value: ethToWithdraw}("");
        require(success, "withdraw() eth transfer failed");

        emit LiquidityRemoved(
            msg.sender,
            _amount,
            ethToWithdraw,
            tokensToWithdraw
        );
        return (ethToWithdraw, tokensToWithdraw);
    }

    /// @notice Gets amount of liquidity provided by account
    /// @param _liquidityProvider address of liquidity provider
    /// @return Returns amount of provided liquidity
    function getLiquidity(address _liquidityProvider)
        public
        view
        returns (uint256)
    {
        uint256 liquidityAmount = liquidity[_liquidityProvider];
        return liquidityAmount;
    }
}
