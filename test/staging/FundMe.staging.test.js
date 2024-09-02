const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

// let variable = false
// let someVar = variable ? "yes" : "no"

// if (variable) { someVar = "yes"} else {someVar = "no"}

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          const sendValue = ethers.utils.parseEther("0.1")

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer

              // Explicitly retrieve the signer for the deployer address
              const deployerSigner = await ethers.getSigner(deployer)

              // Retrieve the contract details using `deployments.get`
              const fundMeDeployment = await deployments.get("FundMe")

              // Get the contract instance using `ethers.getContractAt`
              fundMe = await ethers.getContractAt(
                  "FundMe",
                  fundMeDeployment.address,
                  deployerSigner
              )
          })

          it("allows people to fund and withdraw", async () => {
              await fundMe.fund({ value: sendValue })
              const transactionResponse = await fundMe.withdraw()
              await transactionResponse.wait(1) // Wait for 1 confirmation

              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
