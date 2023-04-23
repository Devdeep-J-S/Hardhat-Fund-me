const networkConfig = {
    11155111: {
        name: 'sepolia',
        pricefeed_address: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
    },
};

const development_chain = ['hardhat', 'localhost'];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = { networkConfig, development_chain, DECIMALS, INITIAL_ANSWER };
