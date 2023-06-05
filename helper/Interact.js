
const alchemyKey = "https://eth-sepolia.g.alchemy.com/v2/v1Ss2dcJMHWq4PcEIXYzOWqEHdYV-KGE";
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);
const contractABI = require('../CrowdFunding.json');
const Tx = require('@ethereumjs/tx').Transaction;

// console.log("web3 ====================>>>>>>",web3);

const contractAddress = '0x067b53612ad65834457BB48477E712420FE49b7B';


console.log('Alchemy Key - ' + alchemyKey);
const network = async () => {
  const networkId = await web3.eth.net.getId();

  console.log('The current network ID is', networkId);
}
network();

// const wallet = web3.eth.accounts.wallet.create();
// // console.log("wallet",wallet)
// wallet.add(web3.eth.accounts.privateKeyToAccount("a638b71096b8dbe8ee26a355dbd4baebd1d43c82ebf5b6281999096e16aecd36"));
// // console.log("wallet account ======>",wallet)


const smartContract = new web3.eth.Contract(
  contractABI.abi,
  contractAddress
);





module.exports.create_Campaign( async function create_Campaign(owner, title, description, target, deadline, image, privatekey, amount) {

try {
  
  const wallet =  web3.eth.accounts.wallet.create();
  // console.log("wallet",wallet)
  wallet.add(web3.eth.accounts.privateKeyToAccount(privatekey));
  const account = web3.eth.accounts.privateKeyToAccount(wallet[0].privateKey);
  console.log("account=====>", account);
  const data = await smartContract.methods.createCampaign(owner, title, description, target, deadline, image).send({ from: account.address });
  const count = await web3.eth.getTransactionCount(account.address);
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = 3000000;
  const rawTx = {
    from: account.address,
    nonce: web3.utils.toHex(count),
    gasPrice: web3.utils.toHex(gasPrice),
    gasLimit: web3.utils.toHex(gasLimit),
    to: contractAddress,
    value: web3.utils.toHex(amount),
    data: data
  };
  console.log("rawTransactions==============>>>", rawTx);
  const tx = new Tx(rawTx, { chain: 'sepolia' });
  console.log("tx==================>>", tx);

  tx.sign(account.privateKey);
  console.log("txSigned==================>>", tx);
  const serializedTx = tx.serialize();

  const receipt = await web3.eth.accounts.sendSignedTransaction('0x' + serializedTx.toString('hex'));

  //   var signedTx =await web3.eth.sign(rawTx ,wallet[0].privateKey);
  //   var serializedTx = signedTx.serialize();
  //   console.log(serializedTx.toString('hex'));
  //   // 0xf889808609184e72a00082271094000000000000000000000000000000000000000080a47f74657374320000000000000000000000000000000000000000000000000000006000571ca08a8bbf888cfa37bbf0bb965423625641fc956967b81d12e23709cead01446075a01ce999b56a8a88504be365442ea61239198e23d1fce7d00fcfc5cd3b44b7215f
  //  const receipt=await web3.eth.accounts.sendSignedTransaction(signedTx);
  return JSON.stringify(receipt);
} catch (error) {
  return error;
}

})

module.exports.DonateToCampaign(async function DonateToCampaign() {
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  const data = await smartContract.methods.donateToCampaign(id).encodeABI();

  const count = await web3.eth.getTransactionCount(account.address);
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = 3000000;

  const rawTx = {
    from: account.address,
    nonce: web3.utils.toHex(count),
    gasPrice: web3.utils.toHex(gasPrice),
    gasLimit: web3.utils.toHex(gasLimit),
    to: contractAddress,
    value: web3.utils.toHex(amount),
    data: data
  };

  const tx = new Tx(rawTx, { chain: 'mainnet' });
  tx.sign(privateKey);

  const serializedTx = tx.serialize();

  const receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
  return message;
})


//get compaigns
module.exports.getcampaigns(async function getcampaigns() {
  const result = await smartContract.methods.getCampaigns().call();
  console.log("result==========>>", result)
  return result;
})


//get donators
module.exports.getCampaignsDonators(async function getCampaignsDonators(id) {
  const result = await smartContract.methods.getDonators(id).call();
  console.log("result==========>>", result)
  return result;
})





