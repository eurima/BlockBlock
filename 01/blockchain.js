const { BN } = require("bn.js");
const Block = require("./block");
const Transaction = require("./transaction");

class Blockchain {
  constructor() {
    this.blockchain = [Block.getGenesis()];
    this.mempool = [];
  }

  // 트랜잭션 추가
  addTransaction(tx) {
    this.mempool.push(tx);
    console.log("추가된 트랜잭션", tx);
  }

  // 블록을 블록체인에 추가
  addBlock(block) {
    // 유효성검증이 추가
    this.blockchain.push(block);
    console.log("추가된 블록", block);
  }

  // 난이도를 활용해서 비트구하기 (난이도 -> 비트)
  difficultyToBits(difficulty) {
    const maximumTarget = "0x00ffff000000" + "0".repeat(64 - 12);
    const difficulty16 = difficulty.toString(16);
    let target = parseInt(maximumTarget, 16) / parseInt(difficulty16, 16);
    let num = new BN(target.toString(16), "hex");
    let compact, nSize, bits;
    nSize = num.byteLength();
    if (nSize <= 3) {
      compact = num.toNumber();
      compact <<= 8 * (3 - nSize);
    } else {
      compact = num.ushrn(8 * (nSize - 3)).toNumber();
    }
    if (compact & 0x800000) {
      compact >>= 8;
      nSize++;
    }
    bits = (nSize << 24) | compact;
    if (num.isNeg()) {
      bits |= 0x800000;
    }
    bits >>>= 0;
    return parseInt(bits.toString(10));
  }

  // 목표값 구하기 (비트 -> 목표값)
  getTarget(difficulty) {
    let bits = this.difficultyToBits(difficulty);
    let bits16 = parseInt("0x" + bits.toString(16), 16);
    let exponent = bits16 >> 24;
    let mantissa = bits16 & 0xffffff;
    let target = mantissa * 2 ** (8 * (exponent - 3));
    let target16 = target.toString(16);
    let result = Buffer.from(
      "0".repeat(64 - target16.length) + target16,
      "hex"
    );
    return result.toString("hex");
  }

  // 채굴 - 난이도, 논스
  mining() {
    // 코인베이스 트랜잭션 만들기
    const coinbaseTx = new Transaction("coinBase", "miner", 50);
    // 블록바디에 넣을 트랜잭션 리스트 만들기
    const transactions = [coinbaseTx, ...this.mempool];
    // 멤풀 초기화
    this.mempool = [];
    // 마지막 블록을 가져오기
    const lastBlock = this.getLastBlock();
    // 마지막 블록의 해시를 가져와서 이전블록해시로 사용하기
    const previousHash = lastBlock.hash;
    // 마지막 블록의 인덱스 가져오기
    const lastBlockIndex = lastBlock.index;
    // 난이도 구하기
    const newDifficulty = this.getDifficulty(lastBlock.difficulty);
    // 새로운 블록 만들기
    const newBlock = new Block({
      index: lastBlockIndex + 1,
      previousHash: previousHash,
      transactions: transactions,
      difficulty: newDifficulty,
      nonce: 0,
    });
    // 해시퍼즐을 찾는 작업
    const target = this.getTarget(newDifficulty);
    while (!(newBlock.getHash() <= target)) {
      //console.log("결과", target, newBlock.nonce, newBlock.getHash());
      console.log("목표값", target);
      console.log("논스", newBlock.nonce);
      console.log("해시값", newBlock.getHash());

      newBlock.nonce++;
    }
    newBlock.hash = newBlock.getHash();
    // 블록체인에 블록을 넣어주기
    this.addBlock(newBlock);
  }

  getDifficulty(difficulty) {
    // 자가제한시스템
    return difficulty;
  }

  getLastBlock() {
    return this.blockchain[this.blockchain.length - 1];
  }

  // 난이도 조절
}

const blockchain = new Blockchain();

blockchain.mining();

console.log("모든 블록", blockchain.blockchain);