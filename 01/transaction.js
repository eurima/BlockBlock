class Transaction{
    constructor(from, to, amount){
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.timestamp = new Date().getTime();
    }
}

module.exports = Transaction; 

// const tx = new Transaction('A','B',10);

// console.log(tx)