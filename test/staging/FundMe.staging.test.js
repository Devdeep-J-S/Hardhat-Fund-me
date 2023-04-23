const { getNamedAccounts, ethers } = require("hardhat");
const { development_chain } = require("../../helper-hardhat-config");
const { assert } = require("chai");

development_chain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe, deployer;
      const send_amount = ethers.utils.parseEther("0.03"); // 100000000000000000
      beforeEach(async () => {
        // fixture is a function that takes an array
        // of tags run local hardhat deploy for test
        deployer = (await getNamedAccounts()).deployer; // get named account
        fundMe = await ethers.getContract("FundMe", deployer); // get contract
      });

      it("Allows to fund and wirhdraw", async () => {
        await fundMe.fund({ value: send_amount });
        await fundMe.withdraw();
        const respose = await fundMe.s_amountfunded(deployer);
        assert.equal(respose.toString(), "0");
      });
    });
