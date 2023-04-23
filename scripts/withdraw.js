const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("withdrawing contract");
  const transactionResponse = await fundMe.withdraw();
  await transactionResponse.wait();
  console.log("Fund withdrawn👍");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
