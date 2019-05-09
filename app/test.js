const BlockChain = require('./blockchain');

const block = new BlockChain();

// block.createNewBlock(2380, 'UUUUUUUU', 'XXXXXXXXXXXXX');

// block.createNewTransaction(100, 'LOVRYUUUUUUUUUUU', 'UUUUUUUUUUU');

// block.createNewBlock(23801, '11UUUUUUUU', '222XXXXXXXXXXXXX');

// const hash = block.hashBlock('HHHHHHHHHHHHHHHH', [{
//     id: 1,
//     name: 'Raph'
// }], 70000)

// console.log(hash);

const previousBlockHash = 'OUUUUUIUIIIIIIIIHHHHHHHHHHHHHHH';

const currentBlockData = [
    {
        amount: 101,
        sender: 'UUUUUUUUUUUUUUUUKK',
        receipient: 'OOOOOOOOOOOOOOOOPPP'
    },
    {
        amount: 7888,
        sender: 'UUUUUUUUUUUUUUUUPPPKK',
        receipient: 'OOOOOOOOOOOOOOOOOOOPPP'
    },
    {
        amount: 9000,
        sender: 'UUUUUUUUUUUUUUUUPIIIIIII',
        receipient: 'OOOOOOOOOOOOOOOOOOOPPPII'
    },
];

//console.log(block.proofOfWork(previousBlockHash, currentBlockData));
console.log(block.hashBlock(previousBlockHash, currentBlockData, '2981193'))
