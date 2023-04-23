const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("deploying contract");
  const transactionResponse = await fundMe.fund({
    value: ethers.utils.parseEther("0.1"), // limit
  });
  await transactionResponse.wait();
  console.log("Sucdessfully funded 👍");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
