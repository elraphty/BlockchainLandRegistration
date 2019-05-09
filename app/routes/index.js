const express = require('express');
const route = express.Router();
const blockChain = require(`${APP_ROOT_PATH}blockchain`);
const axios = require('axios');

const blockNetwork = new blockChain();

route.get('/blockchain', (req, res) => {
    res.send(blockNetwork);
});

route.post('/transaction', (req, res) => {
    const blockNetworkIndex = blockNetwork.createNewTransaction(req.body.amount, req.body.sender, req.body.receipient);
    res.json({ note: `Transaction will be added in blockNetwork ${blockNetworkIndex}` });
});

route.get('/mine', (req, res) => {
    const lastblockNetwork = blockNetwork.getLastblockNetwork();
    const previousblockNetworkHash = lastblockNetwork['hash'];

    const currentblockNetworkData = {
        index: lastblockNetwork['index'] + 1,
        timestamp: Date.now(),
        transactions: blockNetwork.pendingTransactions
    };

    const nonce = blockNetwork.proofOfWork(previousblockNetworkHash, currentblockNetworkData);

    const blockNetworkHash = blockNetwork.hashblockNetwork(previousblockNetworkHash, currentblockNetworkData, nonce);

    const newblockNetwork = blockNetwork.createNewblockNetwork(nonce, previousblockNetworkHash, blockNetworkHash);

    res.json({
        note: 'blockNetwork mined successfully',
        block: blockNetwork
    });
});

// register and broadcast node to the network
route.post('/register-and-broadcast-node', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
    if(blockNetwork.networkNodes.indexOf(newNodeUrl) === -1) blockNetwork.networkNodes.push(newNodeUrl);

    let regNodePromises = [];

    blockNetwork.networkNodes.forEach(networkNodeUrl => {

        let req = axios.post(`${networkNodeUrl}/register-node`, {
            newNodeUrl
        });

        regNodePromises.push(req);

    });

    Promise.all(regNodePromises)
        .then(data => {
            axios.post('/register-nodes-bulk', {
                allNetworkNodes: [...blockNetwork.networkNodes, blockNetwork.currentNodeUrl]
            })
                .then(data => {
                    res.send({ note: 'New Node registered with network successfully' });
                })
        });
});

// register a node with the network
route.post('/register-node', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
    const notAlreadyPresent = blockNetwork.networkNodes.indexOf(newNodeUrl) === -1;
    const notCurrentNode = blockNetwork.currentNodeUrl !== newNodeUrl;

    if(notAlreadyPresent && notCurrentNode) blockNetwork.networkNodes.push(newNodeUrl);

    res.json({ note: 'New node registered successfully with node.' });
});

// register a node with the network
route.post('/register-nodes-bulk', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
});

module.exports = route;