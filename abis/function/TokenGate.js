require('dotenv').config();

const Web3 = require('web3')
let web3 = new Web3(window.ethereum)

let accounts = await web3.eth.getAccounts();

const ABIHTC = require("../abis/contracts/TokenHTC.sol/TokenHTC.json")
const TokenHTC = new web3.eth.Contract(ABIHTC, process.env.TokenHTC)

const ABITokenGate = require("../abis/contracts/TokenGate.sol/TokenGate.json")
const TokenGate = new web3.eth.Contract(ABITokenGate, process.env.TokenGate)

async function deposit(data){
    //user approve token
    await TokenHTC.methods.approve(process.env.Transporter, new BigNumber(data.blockchain_amount).toFixed()).send({
        from: accounts[0], 
        to: process.env.TokenHTC,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
    }, function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
    })
    //user deposit
    await TokenGate.methods.deposit({
        owner: data.owner,
        token: data.token,
        blockExpired: new BigNumber(data.block_expired).toFixed(),
        amount: new BigNumber(data.blockchain_amount).toFixed(),
        none: data.nonce,
        v: data.v, 
        r:data.r, 
        s:data.s
    }).send({
        from: accounts[0],
        to: process.env.TokenGate,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
    }, function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
    })
}

//user withdraw token
async function withdraw(data){
    await TokenGate.methods.withdraw(data.token).send({
        from: process.env.TOKENGATE_SERVER_ADDRESS,
        to: process.env.TokenGate,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
    }, function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
    })
}

//server deposit to vault
async function depositHTCVault(data){
    await TokenHTC.methods.approve(process.env.Transporter, new BigNumber(data.blockchain_amount).toFixed()).send({
        from: process.env.TOKENGATE_SERVER_ADDRESS,
        to: process.env.TokenHTC,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
    }, function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
    })

    await TokenGate.methods.depositVault(
        process.env.TOKENGATE_SERVER_ADDRESS, 
        process.env.TokenHTC, 
        new BigNumber(data.blockchain_amount).toFixed()
        ).send({
            from: process.env.TOKENGATE_SERVER_ADDRESS,
            to: process.env.TokenGate,
            gasLimit: web3.utils.toHex("1000000"),
            gasPrice: await getGasPrice()
        }, function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
    })
}

async function withdrawHTCVault(data){
    await TokenGate.methods.withdrawVault(process.env.TokenHTC, new BigNumber(data.blockchain_amount).toFixed()).send({
        from: process.env.TOKENGATE_SERVER_ADDRESS,
        to: process.env.TokenGate,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
    }, function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
    })
}

async function swapVaultHTCtoPRZ(data){
    await TokenGate.methods.swapVaultHTCtoPRZ(process.env.TokenHTC, process.env.TokenPRZ, new BigNumber(data.blockchain_amount).toFixed()).send({
        from: process.env.TOKENGATE_SERVER_ADDRESS,
        to: process.env.TokenGate,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
    }, function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
    })

    await TokenGate.methods.withdrawVault(process.env.TokenPRZ, new BigNumber(data.blockchain_amount).toFixed()).send({
        from: process.env.TOKENGATE_SERVER_ADDRESS,
        to: process.env.TokenGate,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
    }, function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
    })
}

async function claim(data){
    await TokenGate.methods.claim({
        owner: data.owner,
        token: data.token,
        blockExpired: new BigNumber(data.block_expired).toFixed(),
        amount: new BigNumber(data.amount),
        nonce: data.nonce,
        v: data.v,
        r: data.r,
        s: data.s
    }).send({
        from: accounts[0],
        to: process.env.TokenGate,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
    }, function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
    })
}

async function getGasPrice(){
    return await web3.eth.getGasPrice();
}

window.onload = async () => {

    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      window.web3 = new Web3(window.ethereum);
    } else {
      alert("Please install MetaMask Extension in your browser");
    }
  
    const params = new URLSearchParams(window.location.search)
  
    console.log(params.get('action'))
    console.log(params.get('data'))
  
    switch(params.get('action'))
    {
      case "deposit":
          deposit(JSON.parse(JSON.parse(params.get('data'))));
          break;
      case "depositHTCVault":
            depositHTCVault(JSON.parse(params.get('data')));
            break;
      case "withdrawHTCVault":
            withdrawHTCVault(JSON.parse(params.get('data')))
            break;
        case "withdraw":
            withdraw(JSON.parse(params.get('data')))
            break;
        case "swapVaultHTCtoPRZ":
            swapVaultHTCtoPRZ(JSON.parse(params.get('data')))
        case "claim":
            claim(JSON.parse(params.get('data')))
      default:
          break;
    }
  };