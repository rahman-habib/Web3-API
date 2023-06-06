const express = require("express");
// const window = require("window")
// const Web3=require('web3-eth');
// const document = window.document;
serialize = require('serialize-javascript');
const route = express.Router();
const Web3 = require('web3');
const coreHelper = require('web3-core-helpers');

const contractABI = require('../build/contracts/CrowdFunding.json');
const { check, validationResult } = require("express-validator");
// const { smartContract } = require("../helper/Interact");
// const getcampaigns = require("../helper/Interact");
// const create_Campaign = require("../helper/Interact");

// const DonateToCampaign = require("../helper/Interact");
// const getCampaignsDonators = require("../helper/Interact");
// const Tx = require('@ethereumjs/tx').Transaction;
// // const ethers=require('ethers');
// const alchemyKey = "https://eth-sepolia.g.alchemy.com/v2/v1Ss2dcJMHWq4PcEIXYzOWqEHdYV-KGE";
// const infuraKey="https://sepolia.infura.io/v3/09f4f4b0e0684e158957f135d5427303";
// const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
// const connectWallet = require("../helper/Interaction")
// const web3 = createAlchemyWeb3(infuraKey);
const web3 = new Web3('http://localhost:8545'); // Update with your RPC endpoint

// Get the accounts
web3.eth.getAccounts()
  .then(accounts => {
    console.log('Accounts:', accounts);
  })
  .catch(error => {
    console.error('Error retrieving accounts:', error);
  });
console.log("web3 ====================>>>>>>", web3);
// const ether=new ethers.JsonRpcProvider(infuraKey)
// console.log("ethers==============================>",ethers);

// console.log("accounts=====",accounts[0])
const contractAddress = '0x9A0C9643735737a81845a1364575e52A83ca9348';
const smartContract = new web3.eth.Contract(
  contractABI.abi,
  contractAddress
);
// const contract=new ether._getProvider()
// Convert hex-encoded private key to Uint8Array
function hexToUint8Array(hexString) {
  const hex = hexString.startsWith('0x') ? hexString.slice(2) : hexString;
  const length = hex.length / 2;
  const uint8Array = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    const byteValue = parseInt(hex.substr(i * 2, 2), 16);
    uint8Array[i] = byteValue;
  }

  return uint8Array;
}




//Query All Invoices
route.get("/get-balance/:id?", async (req, res) => {
  try {
    // console.log(web3);
    // Get the balance of an Ethereum address
    const address = req.params.id;
    const balance = await web3.eth.getBalance(address);

    console.log('Balance:', balance, 'ETH');
    return res.status(200).json({ balance: balance });


  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    return res.status(400).json({ error: error });
  }
});

route.post('/create-campaigns',
  [
    check("owner", "owner is required!").not().isEmpty(),
    check("title", "title is required!").not().isEmpty(),
    check("description", "description is required!").not().isEmpty(),
    check("target", "target is required!").not().isEmpty(),
    check("deadline", "deadline is required!").not().isEmpty(),
    check("image", "image is required!").not().isEmpty(),
    check("privateKey", "privateKey is required!").not().isEmpty(),
    check("amount", "amount is required!").not().isEmpty(),
  ],
  async (req, res) => {
    console.log(`campaigns Request: ${JSON.stringify(req.body)}`);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const accounts = await web3.eth.getAccounts()
      const account = accounts[0];
      const privateKey = req.body.privateKey;
      const amount = req.body.amount;
      console.log("account=====>", account[0]);
      const data = await smartContract.methods.createCampaign(req.body.owner, req.body.title, req.body.description, req.body.target, req.body.deadline, req.body.image).send({ from: account, to: contractAddress });
      console.log("contract call......", data);
      res.json({ message: 'Campaign created', transactionHash: data });
    } catch (error) {
      console.log("error============>", error)
      res.status(500).json({ message: 'Failed to create campaign', error: error.message });
    }
  }
);

// Donate to a campaign
route.post(
  '/campaigns/:id/donate',

  [
    check("privateKey", "privateKey is required!").not().isEmpty(),
    check("amount", "amount is required!").not().isEmpty(),
    check("id", "id is required!").not().isEmpty(),
  ],
  async (req, res) => {
    console.log(`campaigns Request: ${JSON.stringify(req.body)}`);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    try {


      const { id } = req.params;
      const { amount } = req.body;
      const { privateKey } = req.body;
      const accounts = await web3.eth.getAccounts()
      const account = accounts[0];
      const data = await smartContract.methods.donateToCampaign(id).send({ from: account, to: contractAddress });
      res.json({ message: 'Donation successful', transactionHash: data });
    } catch (error) {
      res.status(500).json({ message: 'Failed to donate', error: error.message });
    }
  }
);

// Get donators of a campaign
route.get('/campaigns/:id/donators', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await smartContract.methods.getDonators(id).call();

    res.json({ message: 'Donators', data: result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get donators', error: error.message });
  }
});

// Get all campaigns
route.get('/get-campaigns', async (req, res) => {
  try {

    const result = await smartContract.methods.getCampaigns().call();

    res.json({ message: 'Campaigns', data: result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get campaigns', error: error.message });
  }
});



module.exports = route;