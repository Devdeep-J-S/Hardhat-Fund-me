// traditionally
// impport
// function (main)
// calling main function

// now we declare function here
// all other fucnion are called from script

// define func method
// function deploy_func() {
//     console.log('Deploying FundMe');
// }

// module.exports.default = deploy_func;

// name less function method 2 // arrow function
// cosnt getnamedaccount = hre.getNamedAccounts() // get named account
// hre - >  hardhat runtime environment

const {
  networkConfig,
  development_chain,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  //get pricefeed address from helper-hardhat-config.js
  let pricefeed_address;
  if (development_chain.includes(network.name)) {
    const MockV3Aggregator = await deployments.get("MockV3Aggregator");
    pricefeed_address = MockV3Aggregator.address;
  } else {
    pricefeed_address = networkConfig[chainId]["pricefeed_address"];
  }

  // for local host testing using mock

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [pricefeed_address],
    log: true,
    WaitForConfirmations: network.config.blockConfirmations || 1,
  });

  console.log("FundMe is deployed 👍");
  //verification
  if (
    !development_chain.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, [pricefeed_address]);
  }
};

// mocking : https://stackoverflow.com/questions/2665812/what-is-mocking
