const express = require("express");
require("dotenv").config();
// const fs = require("fs");
const BigNumber = require('bignumber.js');

serialize = require("serialize-javascript");
const route = express.Router();
const Web3 = require("web3");
const contractABI = require("../CrowdFunding.json");
const { check, validationResult } = require("express-validator");
const Tx = require("@ethereumjs/tx").Transaction;
const network = process.env.ETHEREUM_NETWORK;
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://${network}.infura.io/v3/${process.env.INFURA_API_ENDPOINT}`
  )
);
const contractAddress = process.env.CONTRACT_ADDRESS;
const smartContract = new web3.eth.Contract(contractABI.abi, contractAddress);

// Convert hex-encoded private key to Uint8Array
function hexToUint8Array(hexString) {
  const hex = hexString.startsWith("0x") ? hexString.slice(2) : hexString;
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

    console.log("Balance:", balance, "ETH");
    return res.status(200).json({ balance: balance });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    return res.status(400).json({ error: error });
  }
});

route.post(
  "/create-campaigns",
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
      // const get = async () => {
      //   const receipt = await create_Campaign(req.body.owner, req.body.title, req.body.description, req.body.target, req.body.deadline, req.body.image, req.body.privateKey, req.body.amount);
      //   return receipt;
      // }
      // const data = await get();

      // const wallet =  web3.eth.accounts.wallet.create();
      // console.log("wallet",wallet)
      const privateKey = req.body.privateKey;
      const amount = req.body.amount;
      // console.log("length", privateKey.length, "     key =  ", privateKey)
      // const privateKey32 = hexToUint8Array(privateKey);
      // console.log("length", privateKey32.length, "     key =  ", privateKey32);
      // wallet.add(web3.eth.accounts.privateKeyToAccount(privateKey));
      // const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      const signer = web3.eth.accounts.privateKeyToAccount(privateKey);
      web3.eth.accounts.wallet.add(signer);

      // console.log("web3 ====================>>>>>>",web3);
      // console.log("account=====>", account);
      const data = await smartContract.methods.createCampaign(
        req.body.owner,
        req.body.title,
        req.body.description,
        req.body.target,
        req.body.deadline,
        req.body.image
      );
      console.log("contract call......", data);
      // const estimateGas = web3.eth.estimateGas();

      // console.log("estimated gass  ", estimateGas);
      const count = await web3.eth.getTransactionCount(signer.address);
      const gasPrice = await web3.eth.getGasPrice();
      console.log("gass price......", gasPrice);
      const gasLimit = web3.eth.getlimit;
      console.log("gass limit =====>", gasLimit);
      console.log("transaction begun......");
      const rawTx = {
        from: signer.address,
        nonce: "16",
        gasPrice: gasPrice,
        gasLimit: web3.utils.toWei("10", "gwei"),
        to: contractAddress,
        value: web3.utils.toWei(amount, "ether"),
        data: data,
      };
      console.log("rawTransactions==============>>>", rawTx);
      const tx = new Tx(signer.sign(rawTx, privateKey));

      //  const transaction=new Tx({data:web3.utils.stringToHex(JSON.stringify(rawTx)),gasLimit:rawTx.gasLimit,gasPrice:rawTx.gasPrice,nonce:rawTx.nonce,value:rawTx.value});

      // web3.eth.sign(transaction,privateKey);

      // const tx=new Tx(web3.utils.toHex(rawTx), { chain: 'sepolia' });
      // console.log("tx==================>>", tx);

      // const txx=await web3.eth.accounts.sign(JSON.stringify(tx),privateKey);
      console.log("txx==================>>", tx);
      // console.log("transaction hash===============>",txx.messageHash);

      // tx.sign(wallet[0].privateKey);

      /// const hexString = Buffer.from(txx, 'utf8').toString('hex');

      const serializedTx = tx.serialize();
      // console.log("serializedTx==================>>", serializedTx);
      const receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
      // const receipt = await web3.eth.sendSignedTransaction(tx);

      // var signedTx =await web3.eth.sign(rawTx ,wallet[0].privateKey);
      // var serializedTx = signedTx.serialize();
      // console.log(serializedTx.toString('hex'));
      // 0xf889808609184e72a00082271094000000000000000000000000000000000000000080a47f74657374320000000000000000000000000000000000000000000000000000006000571ca08a8bbf888cfa37bbf0bb965423625641fc956967b81d12e23709cead01446075a01ce999b56a8a88504be365442ea61239198e23d1fce7d00fcfc5cd3b44b7215f
      //  const receipt=await web3.eth.accounts.sendSignedTransaction(signedTx);

      res.json({ message: "Campaign created", transactionHash: data });
    } catch (error) {
      console.log("error============>", error);
      res
        .status(500)
        .json({ message: "Failed to create campaign", error: error.message });
    }
  }
);

// Donate to a campaign
route.post(
  "/campaigns/:id/donate",

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

      // const receipt = await DonateToCampaign(id, amount, privateKey);
      const signer = web3.eth.accounts.privateKeyToAccount(privateKey);
      console.log("signer......")

      web3.eth.accounts.wallet.add(signer);
      const data = await smartContract.methods.donateToCampaign(id).encodeABI();

      const count = await web3.eth.getTransactionCount(signer.address);
      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = 2500000000;
      console.log("count......",count)
      const bignum=new BigNumber(gasLimit)
      const stringCount = new String(count);
      const rawTx = {
        from: signer.address,
        nonce: web3.utils.toHex(count.toString(),"string"),
        gasPrice: `${gasPrice}`,
        gasLimit: web3.utils.toWei(gasLimit,"wei"),
        to: contractAddress,
        value: web3.utils.toWei(amount, "ether"),
        data: data,
      };
      console.log("rawtx......")

      // const tx = new Tx(rawTx, { chain: "sepolia" });
      console.log("tx......")
      console.log("private key", signer.privateKey)
      // tx.sign(hexToUint8Array(signer.privateKey));
      const tx = await signer.signTransaction(rawTx, web3.eth.privateKey);
      console.log("signwith signer......")
      // const serializedTx = tx.serialize();

      // const receipt = await web3.eth.sendSignedTransaction(
      //   "0x" + serializedTx.toString("hex")
      // );
      console.log("tx =====================>>", tx)
      const receipt = await web3.eth.sendSignedTransaction(
        "0x" + tx.transactionHash.toString("hex")
      );
      console.log("recept===========>>", receipt)
      res.json({
        message: "Donation successful",
        transactionHash: receipt.transactionHash,
      });
    } catch (error) {
      console.log("error........",error)
      res
        .status(500)
        .json({ message: "Failed to donate", error: error.message });
    }
  }
);

// Get donators of a campaign
route.get("/campaigns/:id/donators", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await smartContract.methods.getDonators(id).call();

    res.json({ message: "Donators", data: result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get donators", error: error.message });
  }
});

// Get all campaigns
route.get("/get-campaigns", async (req, res) => {
  try {
    const result = await smartContract.methods.getCampaigns().call();

    res.json({ message: "Campaigns", data: result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get campaigns", error: error.message });
  }
});

module.exports = route;
