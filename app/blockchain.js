const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const uuid = require('uuid/v1');

/** Blockchain base function */
function BlockChain() {
    this.chain = [];
    this.pendingTransactions = [];
    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes =  [];

    this.createNewBlock(100, '0', '0');
}

BlockChain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {

    const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.pendingTransactions,
        nonce,
        hash,
        previousBlockHash
    };

    this.pendingTransactions = [];

    this.chain.push(newBlock);

    return newBlock;
}


BlockChain.prototype.getLastBlock = function() {
    return this.chain[this.chain.length - 1];
}

BlockChain.prototype.createNewTransaction = function(amount, sender, receipient) {

    const newTransaction = {
        amount,
        sender,
        receipient
    };

    this.pendingTransactions.push(newTransaction);

    return this.getLastBlock()['index'] + 1;
}

BlockChain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);

    return hash;
}

/**
 * => Repeatedly hash block of data till it finds correct hash
 * => Uses current block data for the hash and also previous hash
 * => continously changes nonce value until it finds the correct hash
 * => returns to us the correct nonce value that creates the correct hash
 */

BlockChain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

    while(hash.substring(0, 4) !== process.env.SECRET_CODE) {
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        // console.log('hash', hash, hash.substring(0, 4));
    }

    return nonce;
}

module.exports = BlockChain;