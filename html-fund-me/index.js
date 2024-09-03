// in node.js
// require()

// in front-end javascript you can't use require
// import

import { ethers, providers } from "./ethers-5.2.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
const connectStatus = document.getElementById("connectStatus")
const balanceDisplay = document.getElementById("balanceDisplay")
const fundStatus = document.getElementById("fundStatus")
const withdrawStatus = document.getElementById("withdrawStatus")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

// Connect function

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connected!"
        connectStatus.innerHTML = "Connected to MetaMask!"
    } else {
        connectStatus.innerHTML = "MetaMask not found. Please install MetaMask."
    }
}

// fund function

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log("Funding with", ethAmount)
    if (typeof window.ethereum !== "undefined") {
        // provider / connection to the blockchain
        // signer / wallet / someone with some gas
        // contract that we are intracting with
        // ^ ABI & Address
        const provider = new providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // wait for this transaction to finish
            fundStatus.innerHTML = `Funding with ${ethAmount} ETH...`
            await listenForTransactionMine(transactionResponse, provider)
            fundStatus.innerHTML = `Funding complete with ${ethAmount} ETH!`
            // console.log("Done!")
            // listen for the tx to be mined
            // listen foran event
        } catch (error) {
            fundStatus.innerHTML = `Error: ${error.message}`
        }
    }
}

// wait for this transaction to finish

function listenForTransactionMine(transactionResponse, provider) {
    console.log("mining", transactionResponse.hash)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                "Completed with",
                transactionReceipt.confirmation,
                "confirmations",
            )
            resolve()
        })
    })
}

// GetBalance function

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        try {
            const balance = await provider.getBalance(contractAddress)
            balanceDisplay.innerHTML = `Contract Balance: ${ethers.utils.formatEther(balance)} ETH`
            // console.log(ethers.utils.formatEther(balance))
        } catch (error) {
            balanceDisplay.innerHTML = `Error: ${error.message}`
        }
    } else {
        balanceDisplay.innerHTML = "Please install MetaMask"
    }
}

// withdraw function

async function withdraw() {
    console.log(`Withdrawing...`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            withdrawStatus.innerHTML = `Withdrawing...`
            await listenForTransactionMine(transactionResponse, provider)
            withdrawStatus.innerHTML = `Withdrawal complete!`
            // await transactionResponse.wait(1)
        } catch (error) {
            withdrawStatus.innerHTML = `Error: ${error.message}`
        }
    } else {
        withdrawStatus.innerHTML = "Please install MetaMask"
    }
}
