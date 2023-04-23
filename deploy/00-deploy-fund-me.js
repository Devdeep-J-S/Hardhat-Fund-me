// minimal contract to deploy and testing locally
const { network } = require('hardhat');
const { development_chain, DECIMALS , INITIAL_ANSWER } = require('../helper-hardhat-config');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    // const chainId = network.config.chainId; // 31337 for local 

    if (development_chain.includes(network.name)) {
        console.log('Deploying mock fundme Local');
        const contract = await deploy("MockV3Aggregator", { 
            contarct: "MockV3Aggregator",
            from: deployer,
            // args : constructor arguments
            args: [DECIMALS , INITIAL_ANSWER], // how we saw what to give by reading the mock contract constructor 
            log: true,
            });
        console.log('MockV3Aggregator is deployed 👍');
    }
};

module.exports.tags = ['all', 'mock'];