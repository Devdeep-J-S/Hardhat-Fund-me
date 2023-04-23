const { assert, expect } = require("chai");
const { deployments, getNamedAccounts, ethers } = require("hardhat");
const { development_chain } = require("../../helper-hardhat-config");

!development_chain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      // before each test
      let fundMe, deployer, MockV3Aggregator;
      const send_amount = ethers.utils.parseEther("1"); // 100000000000000000
      beforeEach(async () => {
        // fixture is a function that takes an array
        // of tags run local hardhat deploy for test
        deployer = (await getNamedAccounts()).deployer; // get named account
        await deployments.fixture(); // all tags is not working so removed it
        MockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        ); // get contract
        fundMe = await ethers.getContract("FundMe", deployer); // get contract
      });

      // for constructor
      describe("Constructor", async () => {
        // test 1
        it("Should set the right pricefeed address", async () => {
          const respose = await fundMe.s_PriceFeed();
          assert.equal(respose, MockV3Aggregator.address);
        });
      });

      describe("Fund", async () => {
        // test 2
        it("Should give error if not enough ETH is send", async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            "yo min limit is not reached!!!"
          );
        });

        it("Updates amount funded", async () => {
          await fundMe.fund({ value: send_amount });
          const respose = await fundMe.s_amountfunded(deployer);
          //   console.log(respose.toString());
          assert.equal(respose.toString(), send_amount.toString());
        });

        it("Adds funder in array", async () => {
          await fundMe.fund({ value: send_amount });
          const respose = await fundMe.s_funders(0);
          assert.equal(respose, deployer);
        });
      });

      // cheap withdraw test
      describe("Cheap Withdraw", async () => {
        // before each test fund the contract so we can test withdraw
        beforeEach(async () => {
          await fundMe.fund({ value: send_amount });
        });

        it("Should give error if not owner", async () => {
          // get balance from smart constrat which is acting as a wallet
          // part -1 : arrange
          const fundme_balance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const deployer_balance = await fundMe.provider.getBalance(deployer);

          // part -2 : act
          const respose = await fundMe.cheap_withdraw();
          const receipt = await respose.wait(1);

          // gas cost calculation // get it from receit used debbuger here its great tool
          const { gasUsed, effectiveGasPrice } = receipt;
          const gas_cost = gasUsed.mul(effectiveGasPrice);

          const ending_balance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const ending_deployer_balance = await fundMe.provider.getBalance(
            deployer
          );
          // part -3 : assert

          assert.equal(
            fundme_balance.add(deployer_balance).toString(), // .add because big number // string because we are comparing
            ending_balance.add(ending_deployer_balance).add(gas_cost).toString() // end balance + ending deployer balance + gas cost
          );
          assert.equal(ending_balance.toString(), "0");
        });

        it("cheap_withdraw with id multiple fuders are there ", async () => {
          // get balance from smart constrat which is acting as a wallet
          // part -1 : arrange
          // funders are diff than deployer
          const accounts = await ethers.getSigners();
          let fundme_contract;
          for (let i = 1; i < 5; i++) {
            // 0 is deployer
            fundme_contract = await fundMe.connect(accounts[i]);
          }
          await fundme_contract.fund({ value: send_amount });

          const fundme_balance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const deployer_balance = await fundMe.provider.getBalance(deployer);

          // part -2 : act
          const respose = await fundMe.cheap_withdraw();
          const receipt = await respose.wait(1);

          // gas cost calculation // get it from receit used debbuger here its great tool
          const { gasUsed, effectiveGasPrice } = receipt;
          const gas_cost = gasUsed.mul(effectiveGasPrice);

          const ending_balance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const ending_deployer_balance = await fundMe.provider.getBalance(
            deployer
          );

          // part -3 : assert
          assert.equal(
            fundme_balance.add(deployer_balance).toString(), // .add because big number // string because we are comparing
            ending_balance.add(ending_deployer_balance).add(gas_cost).toString() // end balance + ending deployer balance + gas cost
          );
          assert.equal(ending_balance.toString(), "0");

          // check if funders array is empty
          await expect(fundMe.s_funders(0)).to.be.reverted;
          {
            for (let i = 1; i < 5; i++) {
              assert(await fundMe.s_amountfunded(accounts[i].address), 0);
            }
          }
        });

        // test case 3 - only owner can cheap_withdraw
        it("Only allow the owner to cheap_withdraw ", async () => {
          // account[1] = attacker
          const accounts = await ethers.getSigners();
          const fundme_contract = await fundMe.connect(accounts[1]);
          await expect(fundme_contract.cheap_withdraw()).to.be.reverted; // revert because only owner can cheap_withdraw
        });
      });

      // withdraw test
      describe("Withdraw", async () => {
        // before each test fund the contract so we can test withdraw
        beforeEach(async () => {
          await fundMe.fund({ value: send_amount });
        });

        it("Should give error if not owner", async () => {
          // get balance from smart constrat which is acting as a wallet
          // part -1 : arrange
          const fundme_balance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const deployer_balance = await fundMe.provider.getBalance(deployer);

          // part -2 : act
          const respose = await fundMe.withdraw();
          const receipt = await respose.wait(1);

          // gas cost calculation // get it from receit used debbuger here its great tool
          const { gasUsed, effectiveGasPrice } = receipt;
          const gas_cost = gasUsed.mul(effectiveGasPrice);

          const ending_balance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const ending_deployer_balance = await fundMe.provider.getBalance(
            deployer
          );
          // part -3 : assert

          assert.equal(
            fundme_balance.add(deployer_balance).toString(), // .add because big number // string because we are comparing
            ending_balance.add(ending_deployer_balance).add(gas_cost).toString() // end balance + ending deployer balance + gas cost
          );
          assert.equal(ending_balance.toString(), "0");
        });

        it("Withdraw with id multiple fuders are there ", async () => {
          // get balance from smart constrat which is acting as a wallet
          // part -1 : arrange
          // funders are diff than deployer
          const accounts = await ethers.getSigners();
          let fundme_contract;
          for (let i = 1; i < 5; i++) {
            // 0 is deployer
            fundme_contract = await fundMe.connect(accounts[i]);
          }
          await fundme_contract.fund({ value: send_amount });

          const fundme_balance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const deployer_balance = await fundMe.provider.getBalance(deployer);

          // part -2 : act
          const respose = await fundMe.withdraw();
          const receipt = await respose.wait(1);

          // gas cost calculation // get it from receit used debbuger here its great tool
          const { gasUsed, effectiveGasPrice } = receipt;
          const gas_cost = gasUsed.mul(effectiveGasPrice);

          const ending_balance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const ending_deployer_balance = await fundMe.provider.getBalance(
            deployer
          );

          // part -3 : assert
          assert.equal(
            fundme_balance.add(deployer_balance).toString(), // .add because big number // string because we are comparing
            ending_balance.add(ending_deployer_balance).add(gas_cost).toString() // end balance + ending deployer balance + gas cost
          );
          assert.equal(ending_balance.toString(), "0");

          // check if funders array is empty
          await expect(fundMe.s_funders(0)).to.be.reverted;
          {
            for (let i = 1; i < 5; i++) {
              assert(await fundMe.s_amountfunded(accounts[i].address), 0);
            }
          }
        });

        // test case 3 - only owner can withdraw
        it("Only allow the owner to withdraw ", async () => {
          // account[2] = attacker
          const accounts = await ethers.getSigners();
          const fundme_contract = await fundMe.connect(accounts[1]);
          await expect(fundme_contract.withdraw()).to.be.reverted; // revert because only owner can withdraw
        });
      });
    });
