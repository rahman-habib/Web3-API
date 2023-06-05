//Importing Modules
const fs = require("fs");
const path = require("path");
const http = require("http");
// const ethers=require('ethers');
var bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");
var express = require("express");
require('dotenv').config();
// console.log(process.env) ;
// const network = process.env.ETHEREUM_NETWORK;
// const provider = new ethers.providers.InfuraProvider(
//   network,
//   process.env.INFURA_API_KEY
// );
// console.log("ethers==============================>",ethers);
// const signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY, provider);
// const limit = provider.estimateGas({
//   from: signer.address,
//   to: "<to_address_goes_here>",
//   value: ethers.utils.parseUnits("0.001", "ether")
// });

//

//
var app = express();

//Use Methods
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  return res.json({
    Alert: "You are NOT AUTHORIZED! Please leave imidiately.",
  });
});

app.use("/web3", require("./routes/web3"));


//Starting Server...
const server = http.createServer(app);
const port = 9910;
server.listen(port);
console.debug("Blockchain server listening on port " + port);
