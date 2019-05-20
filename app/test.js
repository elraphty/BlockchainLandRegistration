const BlockChain = require('./blockchain');

const block = new BlockChain();

const blockData = {
    "chain": [
        {
            "index": 1,
            "timestamp": 1557959871569,
            "transactions": [],
            "nonce": 2000,
            "hash": "HHHHHHHHYYYY",
            "previousBlockHash": "IIIIIOOOOOOOO"
        },
        {
            "index": 2,
            "timestamp": 1557959924762,
            "transactions": [
                {
                    "amount": 7000,
                    "sender": "UUUUUUUUUUUUUYYYii",
                    "receipient": "TTTTTTTTTTTTUU00",
                    "trasactionId": "1bdf2520776211e99b5269b31a4d89a5"
                },
                {
                    "amount": 10000,
                    "sender": "UUUUUUUUUUUUUYYYii",
                    "receipient": "TTTTTTTTTTTTUU00",
                    "trasactionId": "20966ba0776211e99b5269b31a4d89a5"
                }
            ],
            "nonce": 49743,
            "hash": "01748bc360cf0e1cf5d0983ddf26edd32f0f902afe5377d7943c597d0684fcb2",
            "previousBlockHash": "HHHHHHHHYYYY"
        }
    ],
    "pendingTransactions": [],
    "currentNodeUrl": "http://localhost:5000",
    "networkNodes": []
}


console.log('Valid', block.chainIsValid(blockData.chain));