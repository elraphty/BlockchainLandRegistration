const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const uuid = require('uuid/v1');

/** Blockchain base function */
function BlockChain() {
    this.chain = [];
    this.pendingTransactions = [];
    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes =  [];

    this.createNewBlock(2000, 'IIIIIOOOOOOOO', 'HHHHHHHHYYYY');
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
        receipient,
        trasactionId: uuid().split('-').join('')
    };

    // this.pendingTransactions.push(newTransaction);

    // return this.getLastBlock()['index'] + 1;

    return newTransaction;
}

BlockChain.prototype.addTransactionToPendingTransactions = function(transactionObj) {
    this.pendingTransactions.push(transactionObj);
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

BlockChain.prototype.chainIsValid = function(blockchain) {
    let validChain = true;

    for(let i = 1; i < blockchain.length; i++) {
        const currentBlock = blockchain[i];
        const prevBlock = blockchain[i - 1];

        const blockHash = this.hashBlock(prevBlock['hash'], 
            {
                index: currentBlock['index'],
                transactions: currentBlock['transactions'],
            },

            currentBlock['nonce']
        );

        // console.log('current Block', currentBlock);

        if(blockHash.substring(0, 4) !== process.env.SECRET_CODE) validChain = false;
        if(currentBlock['previousBlockHash'] !== prevBlock['hash']) validChain = false; // chain not valid
        
    }

    const genesisBlock = blockchain[0];

    const correctNonce = genesisBlock['nonce'] === 2000;
    const correctPreviousHash = genesisBlock['previousBlockHash'] === 'IIIIIOOOOOOOO';
    const correctHash = genesisBlock['hash'] === 'HHHHHHHHYYYY';
    const correctTransactions = genesisBlock['transactions'].length === 0;

    if(!correctNonce || !correctPreviousHash || !correctHash || !correctTransactions) {
        console.log('Lastcheck incorect');
        validChain = false;
    }

    return validChain;
}

module.exports = BlockChain;