const express = require('express');
const route = express.Router();
const blockChain = require(`${APP_ROOT_PATH}blockchain`);
// const axios = require('axios');
const rp = require('request-promise');

const blockNetwork = new blockChain();

route.get('/blockchain', (req, res) => {
    res.send(blockNetwork);
});

route.post('/transaction', (req, res) => {
    const newTransaction = req.body;
    const blockIndex = blockNetwork.addTransactionToPendingTransactions(newTransaction);
    res.json({ note: `Transaction will be added in block ${blockIndex}` });
});

// Mine all pending transactions i.e Convert all pending transactions to a hash
route.get('/mine', (req, res) => {
    const lastBlock = blockNetwork.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    // console.log('Prev Hash', previousBlockHash);

    const currentBlockData = {
        index: lastBlock['index'] + 1,
        transactions: blockNetwork.pendingTransactions
    };

    const nonce = blockNetwork.proofOfWork(previousBlockHash, currentBlockData);

    const blockHash = blockNetwork.hashBlock(previousBlockHash, currentBlockData, nonce);

    const newBlock = blockNetwork.createNewBlock(nonce, previousBlockHash, blockHash);

    let regNodePromises = [];

    blockNetwork.networkNodes.forEach(networkNodeUrl => {

        const requestOptions = {
            uri: `${networkNodeUrl}/receive-new-block`,
            method: 'POST',
            body: newBlock,
            json: true
        }

        regNodePromises.push(rp(requestOptions));
    });

    Promise.all(regNodePromises)
        .then(data => {
            res.json({
                note: 'block mined and broadcast successfully',
                block: newBlock
            });
        });
});


route.post('/receive-new-block', (req, res) => {
    const newBlock = req.body;
    const lastBlock = blockNetwork.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
    
    if(correctHash && correctIndex) {
        blockNetwork.chain.push(newBlock);
        blockNetwork.pendingTransactions = [];

        res.json({
            note: 'New block received and accepeted',
            newBlock: newBlock
        });
    } else {
        res.json({
            note: 'New block rejected',
            newBlock: newBlock
        });
    }
});

// register and broadcast node to the network
route.post('/register-and-broadcast-node', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
    // const notCurrentNode = newNodeUrl !== blockNetwork.currentNodeUrl;

    if(blockNetwork.networkNodes.indexOf(newNodeUrl) == -1) blockNetwork.networkNodes.push(newNodeUrl);
    
    let regNodePromises = [];

    blockNetwork.networkNodes.forEach(networkNodeUrl => {
        // console.log('Network nodes', networkNodeUrl);

        let requestOptions = {
            uri: `${networkNodeUrl}/register-node`,
            method: 'POST',
            body: {
                newNodeUrl: newNodeUrl
            },
            json: true
        }

        regNodePromises.push(rp(requestOptions));

    });

    // console.log('Reg Node promises count', regNodePromises.length);

    Promise.all(regNodePromises)
        .then(data => {
            const bulkRequestOptions = {
                uri: `${newNodeUrl}/register-nodes-bulk`,
                method: 'POST',
                body: {
                    allNetworkNodes: [...blockNetwork.networkNodes, blockNetwork.currentNodeUrl]
                },
                json: true
            }

            return rp(bulkRequestOptions)
        })
        .then(data => {
            res.send({ note: 'New Node registered with network successfully' });
        })
        .catch(e => {
            console.log('Error', e);
        })
});

// register a node with the network
route.post('/register-node', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
    // console.log('Icoming Data', newNodeUrl);
    const notAlreadyPresent = blockNetwork.networkNodes.indexOf(newNodeUrl) === -1;
    const notCurrentNode = blockNetwork.currentNodeUrl !== newNodeUrl;

    if(notAlreadyPresent && notCurrentNode) blockNetwork.networkNodes.push(newNodeUrl);

    res.json({ note: 'New node registered successfully with node.' });
});

// register a node with the network
route.post('/register-nodes-bulk', (req, res) => {
    const allNetworkNodes = req.body.allNetworkNodes;
    // console.log('all nodes', allNetworkNodes);
    allNetworkNodes.forEach(networkNodeUrl => {
        const notAlreadyPresent = blockNetwork.networkNodes.indexOf(networkNodeUrl) === -1;
        const notCurrentNode = blockNetwork.currentNodeUrl !== networkNodeUrl;
        if(notAlreadyPresent && notCurrentNode) blockNetwork.networkNodes.push(networkNodeUrl)
    });

    res.json({ note: 'Bulk registration successful.' });
});

// Post a transaction and broadcast to other networks
route.post('/transaction/broadcast', (req, res) => {
    const newTransaction = blockNetwork.createNewTransaction(req.body.amount, req.body.sender, req.body.receipient);

    blockNetwork.addTransactionToPendingTransactions(newTransaction);

    let regNodePromises = [];

    blockNetwork.networkNodes.forEach(networkNodeUrl => {

        const requestOptions = {
            uri: `${networkNodeUrl}/transaction`,
            method: 'POST',
            body: newTransaction,
            json: true
        }

        regNodePromises.push(rp(requestOptions));

    });

    Promise.all(regNodePromises)
        .then(data => {
            res.json({ note: 'Transaction Created and broadcast successfully' });
        });
});

route.get('/consesus', (req, res) => {

    let regNodePromises = [];

    blockNetwork.networkNodes.forEach(networkNodeUrl => {

        const requestOptions = {
            uri: `${networkNodeUrl}/blockchain`,
            method: 'GET',
            json: true
        }

        regNodePromises.push(rp(requestOptions));

    });

    Promise.all(regNodePromises)
        .then(blockchains => {
            const currentChainLength = blockNetwork.chain.length;
            let maxChainLength = currentChainLength;
            let newLongestChain = null;
            let newPendingTransactions = null;

            blockchains.forEach(blockchain => {
                if(blockchain.chain.length > maxChainLength) {
                    maxChainLength = blockchain.chain.length;
                    newLongestChain = blockchain.chain;
                    newPendingTransactions = blockchain.pendingTransactions;
                }
            });

            if(!newLongestChain || (newLongestChain && !blockNetwork.chainIsValid(newLongestChain))) {
                res.json({
                    note: 'Current chain as not been replaced',
                    chain: blockNetwork.chain
                });
            } else if(newLongestChain && blockNetwork.chainIsValid(newLongestChain)) {
                blockNetwork.chain = newLongestChain;
                blockNetwork.pendingTransactions = newPendingTransactions;

                res.json({
                    note: 'This chain has been replaced',
                    chain: blockNetwork.chain
                });
            }
        });
});

route.get('/block/:blockHash', (req, res) => {
    const blockHash = req.params.blockHash;
    const correctBlock = blockNetwork.getBlock(blockHash);

    res.json({
        block: correctBlock
    });

});

route.get('/transaction/:transactionId', (req, res) => {

});

route.get('/address/:address', (req, res) => {

});

module.exports = route;