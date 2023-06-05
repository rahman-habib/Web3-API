
function _getBalance(address){
    const balance = web3.eth.getBalance(address);
    return balance;
}