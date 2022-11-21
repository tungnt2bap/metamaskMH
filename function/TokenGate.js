require('dotenv').config();

const Web3 = require('web3')
let web3 = new Web3(window.ethereum)

let accounts = await web3.eth.getAccounts();

const TOKENPRZ_ADDRESS = ''
const TOKENHTC_ADDRESS = ''
const TOKENGATE_ADDRESS = ''
const TOKENGATE_SERVER_ADDRESS = ''

const ABIHTC = tokenHTC
const TokenHTC = new web3.eth.Contract(ABIHTC, TOKENHTC_ADDRESS)

const ABITokenGate = TokenGate
const TokenGate = new web3.eth.Contract(ABITokenGate, TOKENGATE_ADDRESS)

const sign = async (message) => {
    let web3 = new Web3(window.ethereum)
    let accounts = await web3.eth.getAccounts();
    console.log("accounts: ", accounts[0]);
    let signature = await web3.eth.personal.sign(message, accounts[0], '');
    console.log('sign: ', [accounts, message, signature].join('|'));
    document.getElementById("p1").innerHTML = "Login success! Copy and go back your game!";
  }

//deposit HTC
async function depositHTC(data){
    //user approve token
    await TokenHTC.methods.approve(data.transporter_address, new BigNumber(data.blockchain_amount).toFixed()).send({
        from: data.owner, 
        to: TOKENHTC_ADDRESS,
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
        from: data.owner,
        to: TOKENGATE_ADDRESS,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
    }, function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
        console.log("Hash of the transaction: " + res)
        document.getElementById("p1").innerHTML = " deposit success! Copy and go back your game!";
        createCopyInputButton(res);
    })
}
//swap HTC to PRZ
async function swapHTCtoPRZ(data){
    await TokenGate.methods.swapVaultHTCtoPRZ(TOKENHTC_ADDRESS, TOKENPRZ_ADDRESS, new BigNumber(data.amount).toFixed()).send({
        from: accounts[0],
        to: TOKENHTC_ADDRESS,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
    }, function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
        console.log("Hash of the transaction: " + res)
        document.getElementById("p1").innerHTML = "swap success! Copy and go back your game!";
        createCopyInputButton(res);
    })

    await TokenGate.methods.withdrawVault(TOKENPRZ_ADDRESS, new BigNumber(data.amount).toFixed()).send({
        from: TOKENGATE_SERVER_ADDRESS,
        to: TOKENGATE_ADDRESS,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
    }, function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
        console.log("Hash of the transaction: " + res)
        document.getElementById("p1").innerHTML = "Exchange HTC success! Copy and go back your game!";
        createCopyInputButton(res);
    })
}

//claimPRZ
async function claim(data){
    await TokenGate.methods.claim({
        owner: data.owner,
        token: data.token,
        blockExpired: new BigNumber(data.block_expired).toFixed(),
        amount: new BigNumber(data.blockchain_amount),
        nonce: data.nonce,
        v: data.v,
        r: data.r,
        s: data.s
    }).send({
        from: data.owner,
        to: TOKENGATE_ADDRESS,
        gasLimit: web3.utils.toHex("1000000"),
        gasPrice: await getGasPrice()
    }, function (err, res) {
        if (err) {
          console.log("An error occured", err)
          return
        }
        console.log("Hash of the transaction: " + res)
        document.getElementById("p1").innerHTML = "claim success! Copy and go back your game!";
        createCopyInputButton(res);
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
        case "sign":
            sign(params.get('data'));
            break;
        case "depositHTC":
          depositHTC(JSON.parse(JSON.parse(params.get('data'))));
          break;
        case "swapVaultHTCtoPRZ":
            swapHTCtoPRZ(JSON.parse(params.get('data')))
        case "claim":
            claim(JSON.parse(params.get('data')))
      default:
          break;
    }
  };