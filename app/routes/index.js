const express = require('express');
const route = express.Router();
const BlockChain = require(`${APP_ROOT_PATH}blockchain`);

const Block = new BlockChain();

route.get('/blockchain', (req, res) => {
    res.send(Block);
});

route.post('/transaction', (req, res) => {
    const blockIndex = Block.createNewTransaction(req.body.amount, req.body.sender, req.body.receipient);
    res.json({ note: `Transaction will be added in block ${blockIndex}` });
});

route.get('/mine', (req, res) => {
    const lastBlock = Block.getLastBlock();
    const previousBlockHash = lastBlock['hash'];

    const currentBlockData = {
        index: lastBlock['index'] + 1,
        timestamp: Date.now(),
        transactions: Block.pendingTransactions
    };

    const nonce = Block.proofOfWork(previousBlockHash, currentBlockData);

    const blockHash = Block.hashBlock(previousBlockHash, currentBlockData, nonce);

    const newBlock = Block.createNewBlock(nonce, previousBlockHash, blockHash);

    res.json({
        note: 'block mined successfully',
        block: Block
    });
});

module.exports = route;